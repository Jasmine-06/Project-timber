export const generateOtp = () : string => {
    return String(Math.floor(Math.random() * 100000 + 900000))
};

export const generateTimeStamp = (timeInMinutes : string) : Date => {
    const currentDate = new Date()
    const minuteToAdd = parseInt(timeInMinutes, 10)
    currentDate.setMinutes(currentDate.getMinutes() + minuteToAdd)
    return currentDate;
};