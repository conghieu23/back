export class BaseResponse {
    code: number = 1;
    success: boolean = true;
    message?: string;
    data?: any;

    constructor(code: number = 1,
                success: boolean = true,
                data?: any, message?: string) {
        this.code = code;
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static build(data?: any, message?: string,
            code?: number, success?: boolean) {
        return new BaseResponse(code, success, data, message);
    }

    public static success(message?: string) {
       return this.build(null, message);
    }

    public static error(message?: string) {
        return this.build(null, message, -1, false);
    }
}
