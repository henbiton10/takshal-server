import { IsString, IsNotEmpty, IsDateString, Matches, Validate } from 'class-validator';
import { IsEndDateTimeAfterStartConstraint } from '../validators/date-time-range.validator';

export class CreateOperationOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'שם פקודת מבצע הינו שדה חובה' })
  name: string;

  @IsDateString()
  @IsNotEmpty({ message: 'תאריך התחלה הינו שדה חובה' })
  startDate: string;

  @IsString()
  @IsNotEmpty({ message: 'שעת התחלה הינה שדה חובה' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'פורמט שעה לא תקין' })
  startTime: string;

  @IsDateString()
  @IsNotEmpty({ message: 'תאריך סיום הינו שדה חובה' })
  @Validate(IsEndDateTimeAfterStartConstraint)
  endDate: string;

  @IsString()
  @IsNotEmpty({ message: 'שעת סיום הינה שדה חובה' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'פורמט שעה לא תקין' })
  endTime: string;
}
