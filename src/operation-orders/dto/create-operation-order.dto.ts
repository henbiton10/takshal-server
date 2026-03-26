import { IsString, IsNotEmpty, IsDateString, Matches } from 'class-validator';

export class CreateOperationOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'שם פקודת מבצע הינו שדה חובה' })
  name: string;

  @IsDateString()
  @IsNotEmpty({ message: 'תאריך הינו שדה חובה' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: 'שעה הינה שדה חובה' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'פורמט שעה לא תקין' })
  time: string;
}
