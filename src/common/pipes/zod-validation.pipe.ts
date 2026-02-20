import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: any,
    private returnEarlyOnFirstError: boolean = false,
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = new Map<string, string>();
        for (const issue of error.issues) {
          const fieldPath = issue.path.join('.');

          if (!fieldErrors.has(fieldPath)) {
            const message = !issue.message.includes(fieldPath)
              ? `'${fieldPath}' ${issue.message}`
              : `${issue.message}`;

            fieldErrors.set(fieldPath, message);
          }

          // If we are returning early on the first error, break after processing the first error
          if (this.returnEarlyOnFirstError && fieldErrors.size === 1) {
            break;
          }
        }

        // Combine all field errors into a single message string
        let errorMessages = Array.from(fieldErrors.values()).join(', ').trim();

        // Add a period only if the last character is not a period
        if (errorMessages && !errorMessages.endsWith('.')) {
          errorMessages += '.';
        }

        if (errorMessages) {
          throw new BadRequestException(errorMessages);
        }
      }

      throw new BadRequestException('Validation failed');
    }
  }
}
