import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    template: ''
})
export abstract class BaseFormComponent implements OnInit {
    protected fb = inject(FormBuilder);
    form!: FormGroup;

    ngOnInit(): void {
        this.form = this.fb.group(this.getFormConfig());
    }

    abstract getFormConfig(): Record<string, any>;

    isValid(controlName: string): boolean {
        const control = this.form.get(controlName);
        return control ? control.valid : false;
    }

    hasError(controlName: string, errorType: string): boolean {
        const control = this.form.get(controlName);
        return control ? control.hasError(errorType) && (control.dirty || control.touched) : false;
    }

    markAllAsTouched(): void {
        this.form.markAllAsTouched();
    }

    isFormValid(): boolean {
        return this.form.valid;
    }
}
