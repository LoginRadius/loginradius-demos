// src/app/workflow.tsx
import React from "react";
import { Workflow as WorkflowFlow } from "@loginradius/loginradius-react";

const Workflow: React.FC = () => {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <div
        className="thin-scrollbar w-[400px] rounded-2xl bg-white transition-transform duration-500 scale-100"
        style={{
          transition: "height 0.5s ease",
          maxHeight: "80vh",
        }}
      >
        <WorkflowFlow
          workflowName="testmfaauthenticator"
          clientId="YOUR_CLIENT_ID"
          onSuccess={(response) => {
            console.log("Workflow success:", response);
            window.location.href = "https://www.google.com";
          }}
          onError={(error) => {
            console.error("Workflow error:", error);
          }}
        />
      </div>
    </main>
  );
};

export default Workflow;
