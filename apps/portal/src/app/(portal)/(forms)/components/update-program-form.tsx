"use client"

import { FormFieldType } from '@/types/form-field.types'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import React from 'react'
import FormHeader from '@/components/form/FormHeader'
import ReusableForm from '@/components/form/ReusableForm'
import SubmitButton from '@/components/form/SubmitButton'


interface AddCourseForm {
    image: string,
    title: string,
    code: string,
    related: string,
    prerequisite: string,
    summary: string

}
const courseFields: FormFieldType<AddCourseForm>[] = [
    {
        name: "image",
        label: "Course Image (Click to update)",
        description: "Update the course image",
        className: "col-span-2",
        type: "image"
    },
    {
        name: "title",
        label: "Course Title",
        placeholder: "Enter course title",
        className: "col-span-2",
        type: "text"
    },
    {
        name: "code",
        label: "Course Code",
        placeholder: "Enter course code",
        className: "col-span-2",
        type: "text"
    },
    {
        name: "summary",
        label: "Course Summary",
        placeholder: "Enter the course summary",
        className: "col-span-2",
        type: "text"
    },
    {
        name: "related",
        label: "Related Online Courses",
        placeholder: "Enter the related moodle course",
        className: "col-span-2",
        type: "text"
    },
    {
        name: "prerequisite",
        label: "Prerequisite Courses",
        placeholder: "Enter prerequisite courses",
        className: "col-span-2",
        type: "text"
    }
]
const UpdateCourseForm = () => {
    const form = useForm<AddCourseForm>({
        defaultValues: {
            image: "",
            title: "",
            code: "",
            prerequisite: "",
            related: ""
        }
    })
    return (
        <div className='w-full flex justify-center'>
            <Form {...form}>
                <form className='w-full flex flex-cols-4 flex-col px-8 md:px-24 space-y-3'>
                    <FormHeader label="Update Course" />
                    <ReusableForm<AddCourseForm> formFields={courseFields} />
                    <SubmitButton label="Update This Course" className='w-full' />
                </form>
            </Form>
        </div>
    )
}

export default UpdateCourseForm