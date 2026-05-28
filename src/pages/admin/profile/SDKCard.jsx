// SDKCard renders the demo's authored card chrome (title + sub + status + action)
// and slots an SDK wrapper or its mock fallback inside.
//
// Usage:
//   <SDKCard
//     title="Password"
//     sub="Use a strong, unique password."
//     action={<button>Change</button>}
//     Wrapper={PasswordWrapper}
//     sdkName="PasswordProfileComponent"
//     wrapperProps={{ embedded: true, onSuccess, onError }}
//     fallback={<PasswordMock />}
//   />

import { SDKFrame } from "../../../components/SDKFrame.jsx";

export function SDKCard({
  title,
  sub,
  status,
  action,
  Wrapper,
  sdkName,
  wrapperProps = {},
  fallback,
  bodyClass = "card-body",
  className,
}) {
  const widget = Wrapper ? (
    <Wrapper {...wrapperProps} fallback={fallback} />
  ) : (
    fallback
  );

  return (
    <SDKFrame name={sdkName} props={wrapperProps}>
      <div className={`card ${className || ""}`.trim()}>
        <div className="card-head">
          <div>
            <h3 className="card-title">{title}</h3>
            {sub && <p className="card-sub">{sub}</p>}
          </div>
          {(status || action) && (
            <div className="row" style={{ gap: 8 }}>
              {status}
              {action}
            </div>
          )}
        </div>
        <div className={bodyClass}>{widget}</div>
      </div>
    </SDKFrame>
  );
}
