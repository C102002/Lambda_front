import { Injectable} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Optional } from '../../../../common/helpers/Optional';


@Injectable({
  providedIn: 'root'
})
export class ValidatorService {
  public firstNameAndLastnamePattern: string = '^[A-Za-záéíóúÁÉÍÓÚüÜ]+(?: [A-Za-záéíóúÁÉÍÓÚüÜ]+)? [A-Za-záéíóúÁÉÍÓÚüÜ]+(?: [A-Za-záéíóúÁÉÍÓÚüÜ]+)?$';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public passwordPattern: string = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+=-])\\S{8,16}$";
  public phoneNumberPattern: string = "^(0412|0414|0416|0424|0426)\\d{7}$";
  public numberPattern:string="\\d*";
  public isValidImageExtension = /\.(jpg|jpeg|png|jepg)$/i;
  public Base64ExtensionPattern = /\/9j\//;
  public Base64Pattern =/^data:image\/png;base64,/;



  public firstNameAndLastnamePatternMessage: string = 'Must have first and last name';
  public emailPatternMessage: string = "Must be acceted email. Ex:youremail@gmail.com";
  public passwordPatternMessage: string = "Must have one uppercase,lower case, one number and a special caracter and between 8 or 16 of length Ex:Password12=";
  public phoneNumberPatternMessage: string = "Must be 0414,0416,0412,0424,0426 Ex:04122408080";
  public numberPatternMessage:string="Must be a number";
  public termsAndCoditionsMessage:string='Must accept terms and conditions'
  public isValidField(form : FormGroup, field:string){
    return form.controls[field].errors && form.controls[field].touched;
  }
  public getFieldError(form: FormGroup, field: string): Optional<string> {
    const answer = new Optional<string>('Error in this field');

    if (!form.controls[field] || !form.controls[field].errors) {return answer;}

    const errors = form.controls[field].errors;

    if(errors){
      for (const error of Object.keys(errors)) {
        switch (error) {
          case 'required':
            answer.setValue('This field is required');
            return answer;
          case 'minlength':
            answer.setValue(`This field must have at least ${errors['minlength'].requiredLength} characters`);
            return answer;
          case 'maxlength':
            answer.setValue(`This field must have at most ${errors['maxlength'].requiredLength} characters`);
            return answer;
          case 'requiredtrue':
            answer.setValue(`This field must be accepted`);
            return answer;
          case 'pattern':
            answer.setValue(`Invalid pattern`);
            return answer;
          case 'notEqual':
            answer.setValue(`These fields must be the same`);
            return answer;
        }
      }
    }
    return answer;
  }

  isFieldEqualToOtherField(field:string,field2:string):ValidatorFn{
    return (formGroup:AbstractControl):ValidationErrors | null =>{
      const firstField=formGroup.get(field)
      const secondField=formGroup.get(field2)

      if (!firstField || !secondField){
        return null
      }

      const firstFieldValue=firstField.value
      const secondFieldValue=secondField.value

      if (firstFieldValue!==secondFieldValue){
        secondField.setErrors({notEqual:true})
        return {notEqual:true}
      }
      secondField.setErrors(null)
      return null
    }
  }
}
