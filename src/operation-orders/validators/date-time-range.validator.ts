import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEndDateTimeAfterStart', async: false })
export class IsEndDateTimeAfterStartConstraint implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments): boolean {
    const obj = args.object as any;
    const startDate = obj.startDate;
    const startTime = obj.startTime;
    const endTime = obj.endTime;

    if (!startDate || !endDate || !startTime || !endTime) {
      return true;
    }

    if (endDate < startDate) {
      return false;
    }

    if (endDate === startDate && endTime <= startTime) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const obj = args.object as any;
    const startDate = obj.startDate;
    const endDate = obj.endDate;

    if (endDate < startDate) {
      return 'תאריך סיום חייב להיות אחרי תאריך התחלה';
    }

    return 'שעת סיום חייבת להיות אחרי שעת התחלה';
  }
}
