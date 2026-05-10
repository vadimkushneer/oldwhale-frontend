export type LoginRedirectFrom = {
  pathname?: string;
  search?: string;
  hash?: string;
};

export type LoginRedirectState = {
  from?: LoginRedirectFrom;
};

export function buildLoginRedirectState(location: {
  pathname: string;
  search?: string;
  hash?: string;
}): LoginRedirectState {
  return {
    from: {
      pathname: location.pathname,
      search: location.search ?? "",
      hash: location.hash ?? "",
    },
  };
}

export function buildLoginTarget(from: LoginRedirectFrom | undefined, fallback = "/editor") {
  if (!from?.pathname || !from.pathname.startsWith("/") || from.pathname.startsWith("//")) {
    return fallback;
  }
  return `${from.pathname}${from.search || ""}${from.hash || ""}`;
}
