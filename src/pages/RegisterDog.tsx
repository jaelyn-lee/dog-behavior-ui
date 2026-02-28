import z from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { mockBreeds } from '../constants/breeds'

const schema = z.object({
  ownerName: z.string().min(1, 'Owner name is required'),
  dogName: z.string().min(1, 'Dog name is required'),
  dogBreed: z.string().min(1, 'Dog breed is required'),
  customBreed: z.string().optional(),
  dogAge: z.number().min(0, 'Dog age must be a positive number'),
}).refine(
  (data) => data.dogBreed !== 'other' || (data.customBreed && data.customBreed.trim().length > 0),
  { message: 'Please specify the breed', path: ['customBreed'] }
)

type RegisterDogForm = z.infer<typeof schema>

export const RegisterDog = () => {
  const form = useForm<RegisterDogForm>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      ownerName: '',
      dogName: '',
      dogBreed: '',
      customBreed: '',
      dogAge: 0,
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = form

  const selectedBreed = watch('dogBreed')

  const onSubmit = (data: RegisterDogForm) => {
    console.log('Form submitted:', data)
  }

  return (
    <div>
      <h1 className="text-2xl text-center">Register Your Dog </h1>
      <p className="text-center">
        Tell us about your dog's behavior to get insights!
      </p>
      <form
        className="mt-5 p-4 bg-gray-100 rounded-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <label className="block mb-2 font-bold">Your Name:</label>
        <input
          type="text"
          {...register('ownerName')}
          className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
        />
        {errors.ownerName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.ownerName.message}
          </p>
        )}

        <label className="block mt-4 mb-2 font-bold">Dog's Name:</label>
        <input
          type="text"
          {...register('dogName')}
          className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your dog's name"
        />
        {errors.dogName && (
          <p className="text-red-500 text-sm mt-1">{errors.dogName.message}</p>
        )}

        <label className="block mt-4 mb-2 font-bold">Dog's Breed:</label>
        <Controller
          name="dogBreed"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="breed-select-label">Breed</InputLabel>
              <Select
                labelId="breed-select-label"
                id="breed-select"
                label="Breed"
                {...field}
              >
                {mockBreeds.map((breed) => (
                  <MenuItem key={breed.value} value={breed.value}>
                    {breed.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        {errors.dogBreed && (
          <p className="text-red-500 text-sm mt-1">{errors.dogBreed.message}</p>
        )}
        {selectedBreed === 'other' && (
          <>
            <label className="block mt-4 mb-2 font-bold">Specify Breed:</label>
            <input
              type="text"
              {...register('customBreed')}
              className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your dog's breed"
            />
            {errors.customBreed && (
              <p className="text-red-500 text-sm mt-1">{errors.customBreed.message}</p>
            )}
          </>
        )}

        <label className="block mt-4 mb-2 font-bold">Dog's Age:</label>
        <input
          type="number"
          {...register('dogAge', { valueAsNumber: true })}
          className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your dog's age"
        />
        {errors.dogAge && (
          <p className="text-red-500 text-sm mt-1">{errors.dogAge.message}</p>
        )}

        <button
          type="submit"
          className="mt-4 px-5 py-2.5 cursor-pointer border-2 border-blue-500 text-blue-500 rounded-lg w-full"
        >
          Register Dog
        </button>
      </form>
    </div>
  )
}
