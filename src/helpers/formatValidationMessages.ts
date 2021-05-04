interface ValidationMessage {
    msg: string
}

interface ValidationMessageItems extends Array<ValidationMessage>{}

const formatValidationMessages = (messageArray: ValidationMessageItems) =>
    messageArray.map((message) => message.msg);

export default formatValidationMessages;