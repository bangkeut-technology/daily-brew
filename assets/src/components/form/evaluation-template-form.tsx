import React from 'react';
import { PlusCircle, Trash } from 'lucide-react';
import { PartialEvaluationTemplate } from '@/types/evaluation-template';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { TextField } from '@/components/fields/text-field';
import { TextAreaField } from '@/components/fields/textarea-field';
import { useTranslation } from 'react-i18next';
import { SelectField } from '@/components/select-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { WEIGHT_MAXIMUM, WEIGHT_MINIMUM } from '@/constants/value';

interface EvaluationTemplateFormProps {
    form: UseFormReturn<PartialEvaluationTemplate>;
    isPending?: boolean;
    onSubmit?: (data: PartialEvaluationTemplate) => void;
}

export const EvaluationTemplateForm: React.FunctionComponent<EvaluationTemplateFormProps> = ({ form }) => {
    const { t } = useTranslation();
    const { append, fields, remove } = useFieldArray({
        name: 'criterias',
        control: form.control,
    });

    const options = React.useMemo(
        () =>
            Array.from({ length: WEIGHT_MAXIMUM }, (_, i) => {
                const value = String(i + 1);
                return { label: value, value };
            }),
        [],
    );

    const renderFields = React.useCallback(
        () =>
            fields.map((field, index) => (
                <div key={field.id} className="flex flex-row w-full">
                    <div key={field.id} className="flex flex-col w-full">
                        <div key={field.id} className="flex flex-row w-full">
                            <TextField
                                control={form.control}
                                name={`criterias.${index}.label`}
                                label={t('criteria.label.label')}
                                description={t('criteria.label.description')}
                            />
                            <SelectField
                                control={form.control}
                                className="w-full"
                                name={`criterias.${index}.weight`}
                                options={options}
                                label={t('criteria.weight.label')}
                                description={t('criteria.weight.description', {
                                    maximum: WEIGHT_MAXIMUM,
                                    minimum: WEIGHT_MINIMUM,
                                })}
                            />
                        </div>
                        <TextAreaField
                            control={form.control}
                            name={`criterias.${index}.description`}
                            label={t('criteria.description.label')}
                            description={t('criteria.description.description')}
                        />
                    </div>
                    <Button variant="destructive" onClick={() => remove(index)}>
                        <Trash />
                    </Button>
                </div>
            )),
        [fields, form.control, options, remove, t],
    );

    return (
        <Form {...form}>
            <TextField control={form.control} name="name" label={t('name')} />
            <TextAreaField control={form.control} name="description" label={t('description')} />
            <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-medium">{t('criterias')}</p>
                <Button onClick={() => append({ label: '', description: '', weight: 1 })} variant="outline">
                    <PlusCircle /> {t('criteria.add')}
                </Button>
            </div>
            {renderFields()}
        </Form>
    );
};
