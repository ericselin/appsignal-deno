/** Error reporting API endpoint */
const APPSIGNAL_ERROR_ENDPOINT = "https://appsignal-endpoint.net/errors";

/**
 * See https://docs.appsignal.com/api/public-endpoint/errors.html
 */
type AppsignalApiBody = {
  /** (Epoch) timestamp when error occurred */
  timestamp: number;
  /** Action name where error occurred (e.g. BlogpostController#show or UserInfoLambda#perform) */
  action?: string;
  /** Namespace where error occurred (e.g. frontend or lambda ) */
  namespace: string;
  /** Error object */
  error: AppsignalError;
  /** Full (GIT) revision hash of application */
  revision?: string;
  /** Tags to filter the sample on, or to provide additional context (e.g. {"account_id": "abc-123"}) */
  tags?: Record<string, string>;
  /** Parameters that were given to the function where the error occurred  (e.g. {"id": "abc-123"}) */
  params?: Record<string, string>;
  /** Environment values that were set when the error occurred (e.g. {"REGION": "eu-central-1"}) */
  environment?: Record<string, string>;
  /** Array of breadcrumbs, recorded before the error occurred */
  breadcrumbs?: AppsignalBreadcrumb[];
  /** Language string, used to format the backtrace */
  language: "javascript";
};

type AppsignalError = {
  /** Error name (e.g. StandardError) */
  name: string;
  /** Error message */
  message?: string;
  /** Array of backtrace lines, each line should be a string */
  backtrace?: string[];
};

/**
 * See https://docs.appsignal.com/api/public-endpoint/errors.html
 */
export type AppsignalBreadcrumb = {
  /** Category to label the event under (e.g. network or navigation) */
  category: string;
  /** Contextual information related to the event */
  action: string;
  /** A log message or other string to send to AppSignal */
  message?: string;
  /** An object of metadata related to the event */
  metadata?: unknown;
};

export const getBacktrace = (stack: string | undefined) =>
  stack?.split("\n").slice(1).map((line) => {
    const match = line.match(/at ([^(]*) \(?([^)]*)\)?/);
    if (!match) return "";
    const [_, functionName, location] = match;
    // @-sign does not seem to work great with AppSignal, so just replacing it
    return `${functionName} @ ${location.replace("@", "_")}`;
  });

export const createAppsignalClient = (
  apiKey: string,
  namespace: string,
  initParams: {
    /** Full (GIT) revision hash of application */
    revision?: string;
    /** Environment values that were set when the error occurred (e.g. {"REGION": "eu-central-1"}) */
    environment?: Record<string, string>;
  } = {},
) => {
  const url = new URL(APPSIGNAL_ERROR_ENDPOINT);
  url.searchParams.set("api_key", apiKey);
  const urlString = url.toString();
  return async (error: Error, params: {
    /** Action name where error occurred (e.g. BlogpostController#show or UserInfoLambda#perform) */
    action?: string;
    /** Tags to filter the sample on, or to provide additional context (e.g. {"account_id": "abc-123"}) */
    tags?: Record<string, string>;
    /** Parameters that were given to the function where the error occurred  (e.g. {"id": "abc-123"}) */
    params?: Record<string, string>;
    /** Array of breadcrumbs, recorded before the error occurred */
    breadcrumbs?: AppsignalBreadcrumb[];
  }) => {
    const body: AppsignalApiBody = {
      timestamp: Math.floor(Date.now() / 1000),
      namespace,
      error: {
        name: error.name,
        message: error.message,
        backtrace: getBacktrace(error.stack),
      },
      revision: initParams.revision,
      environment: initParams.environment,
      action: params.action,
      tags: params.tags,
      params: params.params,
      breadcrumbs: params.breadcrumbs,
      language: "javascript",
    };
    const response = await fetch(urlString, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(
        `Could not send error to AppSignal: ${response.status} ${response.statusText}`,
      );
    }
  };
};
