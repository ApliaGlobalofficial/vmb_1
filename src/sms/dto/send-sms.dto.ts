export interface SendSmsDto {
    /**
     * The LiveOne “from” number (must be one of your device senders)
     * e.g. "628812345678"
     */
    sender: string;

    /**
     * One or more destination numbers (E.164 format), pipe-separated:
     * e.g. "919876543210|918765432109"
     */
    number: string;

    /** The actual SMS message body */
    message: string;
}
