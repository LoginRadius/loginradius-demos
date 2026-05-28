import { Component } from "react";

// Defensive boundary so a single widget crash never blanks the whole admin
// portal. On error we render the mock fallback that callers provide.
export class SDKBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("SDK widget failed:", error, info);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}
