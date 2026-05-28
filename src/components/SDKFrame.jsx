// Visual annotation that marks where an SDK widget would be dropped in. The
// outline is controlled by `body[data-sdk-overlay="on"]` so designers can flip
// it on/off without touching component code.

export function SDKFrame({ name, props, children }) {
  const propStr = props
    ? " " +
      Object.entries(props)
        .map(([k, v]) =>
          typeof v === "string" ? `${k}="${v}"` : `${k}={${v}}`,
        )
        .join(" ")
    : "";
  return (
    <div className="sdk-frame">
      <span className="sdk-tag">
        <span className="dot" />
        {`<${name}${propStr} />`}
      </span>
      {children}
    </div>
  );
}
