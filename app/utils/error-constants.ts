export enum ErrorType {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    REQUEST_TIMEOUT = 408,
    INTERNAL_SERVER = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
}

export interface ErrorMessage {
    title: string;
    description: string;
    consoleMessage?: string;
    messageHint: string;
}

export const errorMessages: Record<ErrorType, ErrorMessage> = {
    [ErrorType.BAD_REQUEST]: {
        title: 'Bad Request!',
        description: 'The request cannot be understood by the server',
        consoleMessage: `BAD_REQUEST_ERROR\nRequest malformed\nCannot parse request\n(╯°□°)╯︵ ┻━┻\n./parse_request.sh\nfixing_syntax...`,
        messageHint: '*bat is fixing the syntax*',
    },
    [ErrorType.UNAUTHORIZED]: {
        title: 'Hold up!',
        description: 'Sorry, but I\'ll need to see some ID first!',
        consoleMessage: `AUTHENTICATION_REQUIRED\nAccess denied\nSorry, but I'll need to see some ID first!\n(╯°□°)╯︵ ┻━┻\n./check_credentials.sh\nverifying_identity...`,
        messageHint: '*squints suspiciously at your lack of credentials*',
    },
    [ErrorType.FORBIDDEN]: {
        title: 'Access Denied!',
        description: 'You don\'t have the required permissions',
        consoleMessage: `ACCESS_DENIED\nInsufficient permissions\n(╯°□°)╯︵ ┻━┻\n./check_permissions.sh`,
        messageHint: '*bat shakes its head*',
    },
    [ErrorType.NOT_FOUND]: {
        title: 'Not Found!',
        description: 'The requested resource does not exist',
        consoleMessage: `RESOURCE_NOT_FOUND\nFile not found\n(╯°□°)╯︵ ┻━┻\n./find_resource.sh`,
        messageHint: '*bat is searching everywhere*',
    },
    [ErrorType.METHOD_NOT_ALLOWED]: {
        title: 'Method Not Allowed!',
        description: 'The requested method is not supported',
        consoleMessage: `METHOD_NOT_ALLOWED\nInvalid method\n(╯°□°)╯︵ ┻━┻\n./check_method.sh`,
        messageHint: '*bat points to the right direction*',
    },
    [ErrorType.REQUEST_TIMEOUT]: {
        title: 'Timeout!',
        description: 'The request took too long to process',
        consoleMessage: `REQUEST_TIMEOUT\nConnection timed out\n(╯°□°)╯︵ ┻━┻\n./retry_connection.sh`,
        messageHint: '*bat fell asleep*',
    },
    [ErrorType.INTERNAL_SERVER]: {
        title: 'Server\'s gone batty!',
        description: 'An internal server error occurred',
        consoleMessage: `SYSTEM_PROCESS_TERMINATED\nSegmentation fault\n(core dumped)\n(╯°□°)╯︵ ┻━┻\n./shoo_bats.sh\nplease_hang_on...`,
        messageHint: '*hangs upside down while things are being fixed*',
    },
    [ErrorType.NOT_IMPLEMENTED]: {
        title: 'Not Implemented!',
        description: 'This feature is not available yet',
        consoleMessage: `NOT_IMPLEMENTED\nFeature pending\n(╯°□°)╯︵ ┻━┻\n./implement_feature.sh`,
        messageHint: '*bat is working on it*',
    },
    [ErrorType.BAD_GATEWAY]: {
        title: 'Bad Gateway!',
        description: 'The server received an invalid response',
        consoleMessage: `BAD_GATEWAY\nInvalid upstream response\n(╯°□°)╯︵ ┻━┻\n./check_gateway.sh`,
        messageHint: '*bat is inspecting the gateway*',
    },
    [ErrorType.SERVICE_UNAVAILABLE]: {
        title: 'Service Unavailable!',
        description: 'The service is temporarily unavailable',
        consoleMessage: `SERVICE_UNAVAILABLE\nSystem overloaded\n(╯°□°)╯︵ ┻━┻\n./restart_service.sh`,
        messageHint: '*bat is taking a break*',
    },
    [ErrorType.GATEWAY_TIMEOUT]: {
        title: 'Gateway Timeout!',
        description: 'The gateway did not respond in time',
        consoleMessage: `GATEWAY_TIMEOUT\nUpstream timeout\n(╯°□°)╯︵ ┻━┻\n./ping_gateway.sh`,
        messageHint: '*bat is waiting patiently*',
    },
    [ErrorType.HTTP_VERSION_NOT_SUPPORTED]: {
        title: 'HTTP Version Not Supported!',
        description: 'The requested HTTP version is not supported',
        consoleMessage: `HTTP_VERSION_ERROR\nUnsupported protocol\n(╯°□°)╯︵ ┻━┻\n./check_version.sh`,
        messageHint: '*bat is updating the software*',
    },
} as const;
