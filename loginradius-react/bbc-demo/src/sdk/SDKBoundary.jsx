"use client";

import { Component } from "react";

// A single widget crashing must not blank the whole account page — render the
// static fallback for that section instead and keep the rest interactive.
export class SDKBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[BBC] SDK widget failed to render:", error, info);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) return this.props.fallback ?? null;
    return this.props.children;
  }
}