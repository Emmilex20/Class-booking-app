"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  title: z.string().min(3, "Class name is required"),
  description: z.string().optional(),
  instructor: z.string().optional(),
  duration: z.number().optional(),
  categoryName: z.string().optional(),
  suggestedVenueName: z.string().optional(),
  suggestedVenueAddress: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function RequestClassForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch('/api/class-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          instructor: values.instructor,
          duration: values.duration,
          categoryName: values.categoryName,
          suggestedVenue: {
            name: values.suggestedVenueName,
            address: values.suggestedVenueAddress,
          },
        }),
      })

      const json = await res.json()
      if (json.ok) {
        alert('Request submitted — an admin will review it')
      } else {
        alert('Failed: ' + (json.error || 'Unknown'))
      }
    } catch (err) {
      alert('Failed: ' + (err as any).message)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="grid gap-6 max-w-xl mx-auto p-6 bg-white shadow-lg rounded-2xl border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Request a Class
      </h2>

      {/* Class Name */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Class name*</label>
        <input 
          {...register('title')} 
          className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none ${errors.title ? 'border-red-500' : 'border-gray-300'}`} 
          placeholder="e.g. Yoga for Beginners"
        />
        {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>}
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Short description</label>
        <textarea 
          {...register('description')} 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none resize-none h-24" 
          placeholder="Describe the class briefly"
        />
      </div>

      {/* Instructor */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Instructor (optional)</label>
        <input 
          {...register('instructor')} 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none" 
          placeholder="Instructor name"
        />
      </div>

      {/* Duration */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Duration (minutes)</label>
        <input 
          type="number" 
          {...register('duration', { valueAsNumber: true })} 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none" 
          placeholder="e.g. 60"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Category</label>
        <input 
          {...register('categoryName')} 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none" 
          placeholder="e.g. Fitness"
        />
      </div>

      {/* Suggested Venue Name */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Suggested venue name</label>
        <input 
          {...register('suggestedVenueName')} 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none" 
          placeholder="e.g. Downtown Gym"
        />
      </div>

      {/* Suggested Venue Address */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Suggested venue address</label>
        <input 
          {...register('suggestedVenueAddress')} 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none" 
          placeholder="e.g. 123 Main St, City"
        />
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="w-full py-3 bg-primary text-white font-semibold rounded-xl shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Request Class'}
      </button>
    </form>
  )
}
