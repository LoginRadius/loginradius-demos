# Technical Specification: Email-Based Child Account Creation & Linking Flow

**Document Version:** 1.0.0  
**Status:** Ready for Review  
**Target Audience:** Engineering, Product, and QA Teams  

---

## 1. Executive Summary
This document specifies the technical architecture, data flow, and user experience for transitioning from a username-based child account model to an **Email-as-Primary-Identity** model within the BBC iPlayer Next.js application. 

Under this model:
1. Standalone child accounts are represented as distinct LoginRadius identities, each with a unique email and password (e.g., using sub-addressing like `parent+child@example.com` or dedicated child emails).
2. The system leverages the existing `link_account` Custom Object schema to determine the current user's role (Parent vs. Child) and dynamically tailor the interface.
3. Parents can transition an existing in-app **Viewing Profile** into a standalone **Child Account** by creating credentials for them and establishing secure, bidirectional linking.

---

## 2. Role Determination Logic (Parent vs. Child)

To determine whether the signed-in user is a Parent or a Child, the Next.js application inspects the `link_account` Custom Object retrieved from LoginRadius during session initialization.

### Identification Algorithm
Role determination must follow this exact logic when evaluating the `LinkedAccounts` array:

```typescript
type LinkType = 'parent' | 'child';

interface LinkedAccount {
  LinkType: LinkType;
  ReferenceId: string; // The UID of the linked account
}

interface LinkAccountCustomObject {
  LinkedAccounts?: LinkedAccount[];
  Profiles?: any[];
}
```

1. **Child Session**: 
   * If the `LinkedAccounts` array contains **at least one entry** where `LinkType === 'parent'`, the active identity is a **Child Account**.
   * *Rationale:* The "LinkType" property denotes the relationship of the *other end* of the link. A child account points to a parent.
2. **Parent Session**:
   * If the `LinkedAccounts` array is **empty, undefined, or null**, the identity is treated as a **Parent Account** (by default).
   * If the `LinkedAccounts` array contains **at least one entry** where `LinkType === 'child'`, the identity is confirmed as a **Parent Account**.

### UI Restriction Matrix
Based on the resolved role, the following security constraints must be enforced in the UI layout:

| UI Feature / Route | Parent Account | Child Account |
| :--- | :---: | :---: |
| View Household Profiles (`/profiles`) | ✅ Enabled | ❌ Redirected / Disabled |
| Create Child Profiles | ✅ Enabled | ❌ Blocked & Hidden |
| Create & Promote Standalone Child Accounts | ✅ Enabled | ❌ Blocked & Hidden |
| Manage Parental Controls / PIN Switch | ✅ Enabled | ❌ Blocked & Hidden |
| Personalised iPlayer under-13 safe homepage | ❌ Standard | ✅ Enforced Safe Mode |

---

## 3. Account Promotion & Linking Workflow

When a parent decides to upgrade an existing in-app viewing profile to a full standalone child account, the system guides them through a secure, multi-stage transaction.

```
[Parent UI] 
   │
   ├── 1. Select Profile, Input Child Email, Set Password
   │
[Next.js API Route (Server-Side)]
   │
   ├── 2. Call LoginRadius Management API to create child user
   │      (CustomFields.AccountType = "child")
   │
   ├── 3. Fetch Parent and Child link_account objects
   │
   ├── 4. Execute Mirrored Write:
   │      - Write Parent link object with {LinkType: "child", ReferenceId: childUid}
   │      - Write Child link object with {LinkType: "parent", ReferenceId: parentUid}
   │
   ├── 5. Handle rollback if any step fails
   │
[Parent UI]
   │
   └── 6. Show confirmation screen prompting parent to copy Email & Password
```

### Step 1: Frontend Input & Profile Association
In the Account Management dashboard (`/account?section=linked`), the parent selects "Link Standalone Account". 
1. The UI prompts the parent to select which of their existing viewing profiles (from their `Profiles` array) is being associated with this new account.
2. The parent inputs a unique, valid email address for the child.
3. The parent inputs and confirms a secure password for the child.

### Step 2: Call LoginRadius Create Account API
The client sends the payload to the Next.js backend API handler (`/api/linked-accounts/create-child`).
* **M2M Authorization:** The server utilizes a secure Machine-to-Machine (M2M) bearer token to call the LoginRadius Management API.
* **API Endpoint:** `POST /identity/v2/manage/account`
* **Custom Fields Injection:** The child account must be created with `CustomFields.AccountType = "child"` to denote its system role.

### Step 3: Set Password
The password provided by the parent is set directly on creation via the account registration payload.

### Step 4: Display Confirmation & Credentials Handoff
Once the account is successfully provisioned, the UI transitions to a **Credentials Handoff Screen**.
* The parent is prompted to copy the child's credentials immediately.
* **Copy Button:** A secure "Copy Email & Password" widget is displayed to facilitate offline credential sharing with the child.

### Step 5: Mirrored Custom Object Writes (Bidirectional Link)
To link the accounts permanently, the Next.js handler must update the custom objects for **both** the parent and child identities:
1. **Parent Update:** Append `{ LinkType: "child", ReferenceId: <Child_UID> }` to the parent's `LinkedAccounts` array.
2. **Child Update:** Append `{ LinkType: "parent", ReferenceId: <Parent_UID> }` to the child's `LinkedAccounts` array.
3. **Profile Extraction:** The selected profile's settings can be copied or associated with the child's profile array to preserve watch history and personalisation.

---

## 4. Custom Object Schema & API Payloads

### 4.1 Parent `link_account` Custom Object
```json
{
  "LinkedAccounts": [
    {
      "LinkType": "child",
      "ReferenceId": "f8f8370165f84e99b848a80c1e4b2652"
    }
  ],
  "Profiles": [
    {
      "Id": "prf_01M1G8SE30MTBW3K5WE3J4HVRR",
      "DisplayName": "Jamie",
      "DateOfBirth": "2016-04-01T00:00:00.000Z",
      "AllowPersonalisation": true,
      "AllowMarketingDataTransfer": false,
      "Status": "active"
    }
  ]
}
```

### 4.2 Child `link_account` Custom Object
```json
{
  "LinkedAccounts": [
    {
      "LinkType": "parent",
      "ReferenceId": "be9f220bab134d3596d6f08e4705d3b3"
    }
  ]
}
```

### 4.3 LoginRadius Registration Payload (`POST /identity/v2/manage/account`)
```json
{
  "Email": [
    {
      "Type": "Primary",
      "Value": "child-identity@example.com"
    }
  ],
  "Password": "SecureChildPassword123!",
  "CustomFields": {
    "AccountType": "child"
  },
  "IsActive": true,
  "EmailVerified": true
}
```

---

## 5. Next.js Transactional Route Implementation Blueprint

Because LoginRadius does not offer cross-user transactions, the backend handler must implement a robust write-and-rollback strategy to prevent orphaned links if a network error occurs.

```javascript
// src/app/api/linked-accounts/create-child/route.js
import { NextResponse } from 'next/server';
import { getCallerUid } from '@/server/auth'; 
import { getM2mToken, createLoginRadiusAccount } from '@/server/loginradius';
import { getLinkAccountObject, writeCustomObject } from '@/server/linkedAccounts';

export async function POST(request) {
  let createdChildUid = null;
  let parentObjectRecordId = null;
  let originalParentLinks = [];

  try {
    // 1. Resolve & Authenticate the Parent
    const parentToken = request.headers.get('Authorization');
    const parentUid = await getCallerUid(parentToken);
    
    const { childEmail, childPassword, selectedProfileId } = await request.json();

    const m2mToken = await getM2mToken();

    // 2. Resolve Parent's Custom Object
    const parentObj = await getLinkAccountObject(parentUid, m2mToken);
    parentObjectRecordId = parentObj.objectRecordId;
    originalParentLinks = parentObj.LinkedAccounts || [];

    // Enforce business limits (max 20 linked accounts/profiles)
    if (originalParentLinks.length >= 20) {
      return NextResponse.json({ error: "Linked account limit reached (Max 20)." }, { status: 400 });
    }

    // 3. Create Child Account in LoginRadius
    const childProfilePayload = {
      Email: [{ Type: "Primary", Value: childEmail }],
      Password: childPassword,
      CustomFields: { AccountType: "child" },
      IsActive: true,
      EmailVerified: true
    };
    
    const childAccount = await createLoginRadiusAccount(childProfilePayload, m2mToken);
    createdChildUid = childAccount.Uid;

    // 4. Update Parent's Custom Object (Append Link)
    const updatedParentLinks = [
      ...originalParentLinks,
      { ReferenceId: createdChildUid, LinkType: 'child' }
    ];

    const parentWriteSuccess = await writeCustomObject(
      parentUid,
      { LinkedAccounts: updatedParentLinks },
      m2mToken,
      parentObjectRecordId
    );

    if (!parentWriteSuccess) {
      throw new Error("Failed to write link to Parent Custom Object.");
    }

    // 5. Initialize & Write Child's Custom Object (Mirror Write)
    const childLinkObject = {
      LinkedAccounts: [
        { ReferenceId: parentUid, LinkType: 'parent' }
      ]
    };

    try {
      await writeCustomObject(
        createdChildUid,
        childLinkObject,
        m2mToken
        // Leaving recordId undefined triggers a POST creation for new custom object
      );
    } catch (childWriteError) {
      // --- ROLLBACK TRANSACTION ---
      console.error("Mirror write to child failed. Reverting parent modifications...", childWriteError);
      
      // Rollback Parent Link
      await writeCustomObject(
        parentUid,
        { LinkedAccounts: originalParentLinks },
        m2mToken,
        parentObjectRecordId
      );

      // Rollback newly created LoginRadius Child Account
      await deleteLoginRadiusAccount(createdChildUid, m2mToken);

      throw new Error("Transactional linking failed. Reverted parent changes and removed dangling child record.");
    }

    return NextResponse.json({
      success: true,
      childUid: createdChildUid,
      message: "Bidirectional linking successfully established."
    }, { status: 201 });

  } catch (error) {
    console.error("Child Promotion Flow Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 6. Parental Management of Standalone Child Accounts (Administration & Recovery)

Because child accounts do not have self-service administration capabilities (such as recovering or resetting their own passwords, as children shouldn't manage their credentials directly or may lack independent access to secure mailboxes), the parent must be empowered to manage and administer child accounts.

The Parent Dashboard (`/account?section=linked`) will provide dedicated administrative controls for each linked child account. These controls leverage LoginRadius Management APIs secured by server-side Machine-to-Machine (M2M) tokens.

### 6.1 Architectural Rules & Security Constraints
1. **Access Delegation Validation Gate**: To prevent cross-parent privilege escalation, any request to retrieve or modify a child's account details MUST first be validated on the Next.js server. The backend must inspect the parent's `link_account` Custom Object `LinkedAccounts` array to confirm that the target `childUid` is indeed linked with `LinkType === 'child'`.
2. **Server-Side API Delegation**: All requests to retrieve child profile data or reset child passwords must be handled via a Next.js server-side route handler using the M2M token. The client (parent's browser) must authenticate via their master OIDC bearer token, and the child's UID must be retrieved/updated by the server.

### 6.2 View Child Account Profile (GET Flow)
To display the child's registration status, active status, and log details on the parent account dashboard, the application retrieves the child's identity profile.

* **Next.js Backend API Route**: `GET /api/linked-accounts/child/[childUid]`
* **LoginRadius Endpoint**: `GET /identity/v2/manage/account` with the child's UID as a path parameter (Retrieve Account by UID GET).
* **Authentication**: Authorized using the secure M2M client token.
* **Response Payload Handling**: Strips out sensitive backend parameters (like credential hashes or internal IDs) and returns clean account telemetry (e.g., `CreatedDate`, `LastLoginDate`, `IsActive`, and `EmailVerified`) to render in the parent dashboard.

### 6.3 Admin-Led Password Reset (PUT Flow)
When a child forgets their password or needs an administrative credential rotation, the parent can generate a new secure password on their behalf directly inside the parent account context.

* **Next.js Backend API Route**: `PUT /api/linked-accounts/child/[childUid]/reset-password`
* **Request Payload (Frontend to Next.js)**:
  ```json
  {
    "newPassword": "ParentSelectedSecurePassword123!"
  }
  ```
* **LoginRadius Endpoint**: `PUT /identity/v2/manage/account/{uid}` (Update Account by UID PUT)
* **Path Parameter**: `uid = <Child_UID>`
* **Request Payload (Next.js to LoginRadius)**:
  ```json
  {
    "Password": "ParentSelectedSecurePassword123!"
  }
  ```
* **Authentication**: Authorized using the cached M2M token.
* **Response**: Returns a success HTTP 200 message. The parent UI then displays the updated password in a copyable format, prompting the parent to share the new credentials offline.

---

### 6.4 Next.js Child Account Management Route Implementation Blueprint

Below is the Next.js App Router route handler configuration for `/api/linked-accounts/child/[uid]/route.js` executing both operations securely:

```javascript
// src/app/api/linked-accounts/child/[uid]/route.js
import { NextResponse } from 'next/server';
import { getCallerUid } from '@/server/auth';
import { getM2mToken, retrieveLoginRadiusAccountByUid, updateLoginRadiusAccount } from '@/server/loginradius';
import { getLinkAccountObject } from '@/server/linkedAccounts';

// Security Helper: Ensure the parent is authorized to manage this specific child
async function validateParentChildRelationship(parentUid, childUid, m2mToken) {
  const parentObj = await getLinkAccountObject(parentUid, m2mToken);
  const linkedAccounts = parentObj.LinkedAccounts || [];
  const isLinked = linkedAccounts.some(
    (link) => link.ReferenceId === childUid && link.LinkType === 'child'
  );
  if (!isLinked) {
    throw new Error("Unauthorized: Target account is not linked as a child of this parent.");
  }
}

// 1. GET: Retrieve Child Account Details for Parent Dashboard View
export async function GET(request, { params }) {
  try {
    const { uid: childUid } = params;
    const parentToken = request.headers.get('Authorization');
    const parentUid = await getCallerUid(parentToken);

    const m2mToken = await getM2mToken();

    // Validate relationship (Prevents ID spoofing & cross-account leakage)
    await validateParentChildRelationship(parentUid, childUid, m2mToken);

    // Call LoginRadius Retrieve Account by UID GET API
    const childAccount = await retrieveLoginRadiusAccountByUid(childUid, m2mToken);

    // Extract secure child metrics for dashboard presentation
    const secureChildView = {
      Uid: childAccount.Uid,
      Email: childAccount.Email?.[0]?.Value || '',
      CreatedDate: childAccount.CreatedDate,
      LastLoginDate: childAccount.LastLoginDate,
      IsActive: childAccount.IsActive,
      EmailVerified: childAccount.EmailVerified
    };

    return NextResponse.json(secureChildView, { status: 200 });

  } catch (error) {
    console.error("GET Child Account Error:", error);
    const status = error.message.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

// 2. PUT: Parent-Led Admin Password Reset
export async function PUT(request, { params }) {
  try {
    const { uid: childUid } = params;
    const parentToken = request.headers.get('Authorization');
    const parentUid = await getCallerUid(parentToken);
    
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const m2mToken = await getM2mToken();

    // Validate relationship
    await validateParentChildRelationship(parentUid, childUid, m2mToken);

    // Call LoginRadius Update Account by UID PUT API to reset password
    const updatePayload = {
      Password: newPassword
    };

    const updateResponse = await updateLoginRadiusAccount(childUid, updatePayload, m2mToken);

    if (!updateResponse || updateResponse.Uid !== childUid) {
      throw new Error("Failed to update password in LoginRadius.");
    }

    return NextResponse.json({ 
      success: true, 
      message: "Child password updated successfully." 
    }, { status: 200 });

  } catch (error) {
    console.error("PUT Reset Child Password Error:", error);
    const status = error.message.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
```

---

## 7. Implementation Checklist & Edge Cases

*   **Sub-Addressing Support:** Ensure your validation regex on the client side permits characters like `+` to allow parents to use sub-addressed variations of their email (e.g., `parent+kidsname@example.com`) if their children do not have standalone mailboxes.
*   **Case Sensitivity of Emails:** Enforce lowercase coercion of emails before issuing API payloads to LoginRadius to prevent lookup mismatches.
*   **Duplicate Display Names:** Validate selected profile displays to prevent confusion across parent and child sessions in shared browsers.
*   **Profile Clean-up:** If a parent deletes a viewing profile that has already been converted to an account, the child link should remain intact; the accounts represent independent identity records once created.
