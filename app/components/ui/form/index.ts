import type { VariantProps } from 'tailwind-variants';
import type { FormError, FormErrorEvent, FormInputEvents, FormSchema, FormSubmitEvent } from '~/types/form';
import { tv } from 'tailwind-variants';

export { default as Form } from './Form.vue';
export { default as FormField } from './FormField.vue';
export { FieldArray as FormFieldArray } from 'vee-validate';

export const formField = tv({
    slots: {
        root: '',
        wrapper: '',
        labelWrapper: 'flex items-center justify-between',
        label: 'block font-medium text-base-content',
        container: 'relative mt-1',
        description: 'text-base-content/70',
        error: 'mt-2 text-error',
        hint: 'text-base-content/70',
        help: 'mt-2 text-base-content/70',
    },
    variants: {
        size: {
            xs: {
                root: 'text-2xs',
            },
            sm: {
                root: 'text-xs',
            },
            md: {
                root: 'text-sm',
            },
            lg: {
                root: 'text-base',
            },
            xl: {
                root: 'text-lg',
            },
        },
        required: {
            true: {
                label: 'after:ms-0.5 after:text-error after:content-[\'*\']',
            },
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

export type FormFieldVariants = VariantProps<typeof formField>;

export interface FormFieldProps {
    /**
     * The element or component this component should render as.
     * @defaultValue 'div'
     */
    as?: any;
    /** The name of the FormField. Also used to match form errors. */
    name?: string;
    /** A regular expression to match form error names. */
    errorPattern?: RegExp;
    label?: string;
    description?: string;
    help?: string;
    error?: string | boolean;
    hint?: string;
    /**
     * @defaultValue 'md'
     */
    size?: FormFieldVariants['size'];
    required?: boolean;
    /** If true, validation on input will be active immediately instead of waiting for a blur event. */
    eagerValidation?: boolean;
    /**
     * Delay in milliseconds before validating the form on input events.
     * @defaultValue `300`
     */
    validateOnInputDelay?: number;
    class?: any;
    ui?: Partial<typeof formField.slots>;
}

export interface FormFieldSlots {
    label: (props: { label?: string }) => any;
    hint: (props: { hint?: string }) => any;
    description: (props: { description?: string }) => any;
    help: (props: { help?: string }) => any;
    error: (props: { error?: string | boolean }) => any;
    default: (props: { error?: string | boolean }) => any;
}

export const form = tv({
    base: '',
});

export interface FormProps<T extends object> {
    id?: string | number;
    /** Schema to validate the form state. Supports Standard Schema objects, Yup, Joi, and Superstructs. */
    schema?: FormSchema<T>;
    /** An object representing the current state of the form. */
    state: Partial<T>;
    /**
     * Custom validation function to validate the form state.
     * @param state - The current state of the form.
     * @returns A promise that resolves to an array of FormError objects, or an array of FormError objects directly.
     */
    validate?: (state: Partial<T>) => Promise<FormError[]> | FormError[];
    /**
     * The list of input events that trigger the form validation.
     * @defaultValue `['blur', 'change', 'input']`
     */
    validateOn?: FormInputEvents[];
    /** Disable all inputs inside the form. */
    disabled?: boolean;
    /**
     * Delay in milliseconds before validating the form on input events.
     * @defaultValue `300`
     */
    validateOnInputDelay?: number;
    /**
     * If true, schema transformations will be applied to the state on submit.
     * @defaultValue `true`
     */
    transform?: boolean;
    /**
     * When `true`, all form elements will be disabled on `@submit` event.
     * This will cause any focused input elements to lose their focus state.
     * @defaultValue `true`
     */
    loadingAuto?: boolean;
    class?: any;
    onSubmit?: ((event: FormSubmitEvent<T>) => void | Promise<void>) | (() => void | Promise<void>);
}

export interface FormEmits<T extends object> {
    (e: 'submit', payload: FormSubmitEvent<T>): void;
    (e: 'error', payload: FormErrorEvent): void;
}

export interface FormSlots {
    default: (props?: { errors: FormError[] }) => any;
}
