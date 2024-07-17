


export class MyDate {

    public static isValid = (date: any):boolean => {
        return date instanceof Date && !isNaN(date.getTime());
    }
}