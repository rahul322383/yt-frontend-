/* eslint-disable no-unused-vars */
"use client"
import React, { useState, useRef, useEffect, useCallback } from "react"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "react-hot-toast"
import API from "../../../utils/axiosInstance.jsx"

const categories = [
  { id: "22", name: "People & Blogs" },
  { id: "1", name: "Film & Animation" },
  { id: "10", name: "Music" },
]

const privacyOptions = [
  { id: "public", label: "Public", description: "Anyone can view this video" },
  { id: "private", label: "Private", description: "Only you can view this video" },
  { id: "unlisted", label: "Unlisted", description: "Anyone with the link can view" },
]

export default function VideoUploadModal({ playlistId, onClose, onUploadSuccess }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    category: "22",
    privacyStatus: "private",
    allowComments: true,
    allowRatings: true,
    language: "en",
    videoFile: null,
    thumbnailFile: null,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)

  const modalRef = useRef(null)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose, loading])

  // Generate previews for selected files
  useEffect(() => {
    if (form.videoFile) {
      const previewUrl = URL.createObjectURL(form.videoFile)
      setFilePreview(previewUrl)
      return () => URL.revokeObjectURL(previewUrl)
    } else {
      setFilePreview(null)
    }
  }, [form.videoFile])

  useEffect(() => {
    if (form.thumbnailFile) {
      const previewUrl = URL.createObjectURL(form.thumbnailFile)
      setThumbnailPreview(previewUrl)
      return () => URL.revokeObjectURL(previewUrl)
    } else {
      setThumbnailPreview(null)
    }
  }, [form.thumbnailFile])

  const validateStep1 = useCallback(() => {
    const errs = {}
    if (!form.title.trim()) errs.title = "Title is required"
    if (form.title.length > 100) errs.title = "Title too long (max 100 chars)"
    return errs
  }, [form.title])

  const validateStep2 = useCallback(() => {
    const errs = {}
    if (!form.videoFile) {
      errs.videoFile = "Video file is required"
    } else if (form.videoFile.size > 500 * 1024 * 1024) {
      errs.videoFile = "File too large (max 500MB)"
    }
    return errs
  }, [form.videoFile])

  const handleNext = useCallback(() => {
    if (step === 1) {
      const errs = validateStep1()
      if (Object.keys(errs).length) {
        setErrors(errs)
        return
      }
    }
    if (step === 2) {
      const errs = validateStep2()
      if (Object.keys(errs).length) {
        setErrors(errs)
        return
      }
    }
    setErrors({})
    setStep(step + 1)
  }, [step, validateStep1, validateStep2])

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1)
  }, [step])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target
    if (type === "file") {
      setForm((f) => ({ ...f, [name]: files?.[0] || null }))
    } else if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
    setErrors((errs) => ({ ...errs, [name]: null }))
  }, [])

  const handleUpload = useCallback(async () => {
    const errs = validateStep2()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setErrors({})
    setUploadProgress(0)

    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value)
        }
      })

      const response = await API.post(
        `/users/playlist/${playlistId}/videos`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
              setUploadProgress(percent)
            }
          },
        }
      )

      toast.success("Video uploaded successfully!")
      onUploadSuccess?.(response.data.data)
      onClose()
    } catch (err) {
      console.error("Upload error:", err)
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Upload failed. Please try again."
      toast.error(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
      setUploadProgress(null)
    }
  }, [form, playlistId, onUploadSuccess, onClose, validateStep2])

  const steps = [
    {
      label: "Details",
      content: (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          <Input
            label="Title *"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
            maxLength={100}
            placeholder="Enter a title that describes your video"
          />
          <TextArea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell viewers about your video"
            maxLength={5000}
          />
          <Input
            label="Tags (comma separated)"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
          />
        </motion.div>
      ),
    },
    {
      label: "Files & Category",
      content: (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          <FileInput
            label="Video File *"
            name="videoFile"
            accept="video/*"
            onChange={handleChange}
            error={errors.videoFile}
            preview={filePreview}
            required
          />
          <FileInput
            label="Thumbnail (optional)"
            name="thumbnailFile"
            accept="image/*"
            onChange={handleChange}
            preview={thumbnailPreview}
          />
          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            options={categories}
          />
        </motion.div>
      ),
    },
    {
      label: "Visibility",
      content: (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Privacy</label>
            <div className="space-y-3">
              {privacyOptions.map((option) => (
                <label key={option.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="privacyStatus"
                    value={option.id}
                    checked={form.privacyStatus === option.id}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <Checkbox
            name="allowComments"
            checked={form.allowComments}
            onChange={handleChange}
            label="Allow comments"
          />
          <Checkbox
            name="allowRatings"
            checked={form.allowRatings}
            onChange={handleChange}
            label="Allow ratings"
          />
        </motion.div>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Upload Video</h2>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl p-1"
          >
            &times;
          </button>
        </div>

        <div className="flex border-b dark:border-gray-700">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => !loading && setStep(i + 1)}
              className={clsx(
                "w-1/3 text-center py-3 font-medium transition-colors",
                step === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
                loading && "opacity-50 cursor-not-allowed"
              )}
              disabled={loading}
            >
              Step {i + 1}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            {steps[step - 1].content}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className={clsx(
                "flex-1 py-2.5 rounded font-medium",
                "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600",
                "text-gray-800 dark:text-gray-200",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className={clsx(
                "flex-1 py-2.5 rounded font-medium",
                "bg-blue-600 hover:bg-blue-700 text-white",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleUpload}
              disabled={loading}
              className={clsx(
                "flex-1 py-2.5 rounded font-medium",
                "bg-blue-600 hover:bg-blue-700 text-white",
                "flex items-center justify-center gap-2",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Spinner />
                  Uploading... {uploadProgress && `${uploadProgress}%`}
                </>
              ) : (
                "Upload Video"
              )}
            </button>
          )}
        </div>

        {uploadProgress !== null && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mx-6 mb-6 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {errors.submit && (
          <div className="px-6 pb-4">
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded">
              {errors.submit}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function Input({ label, name, type = "text", value, onChange, error, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={type === "file" ? undefined : value}
        onChange={onChange}
        className={clsx(
          "w-full px-3 py-2 rounded border focus:outline-none focus:ring-2",
          "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400",
          error 
            ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-800" 
            : "border-gray-300 focus:ring-blue-200 dark:focus:ring-blue-800"
        )}
        {...rest}
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}

function TextArea({ label, name, value, onChange, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">
        {label}
      </label>
      <textarea
        name={name}
        rows={4}
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full px-3 py-2 rounded border focus:outline-none focus:ring-2",
          "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400",
          "border-gray-300 focus:ring-blue-200 dark:focus:ring-blue-800"
        )}
        {...rest}
      />
    </div>
  )
}

function FileInput({ label, name, onChange, error, preview, ...rest }) {
  const fileInputRef = useRef(null)
  
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">
        {label}
      </label>
      
      {preview ? (
        <div className="mb-2">
          {rest.accept?.includes("image") ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-40 rounded border border-gray-300 dark:border-gray-600"
            />
          ) : (
            <video 
              src={preview} 
              controls
              className="max-h-40 rounded border border-gray-300 dark:border-gray-600"
            />
          )}
        </div>
      ) : null}
      
      <div 
        onClick={handleClick}
        className={clsx(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer",
          "hover:border-blue-500 transition-colors",
          "dark:border-gray-600 dark:hover:border-blue-500",
          error && "border-red-500 dark:border-red-500"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          onChange={onChange}
          className="hidden"
          {...rest}
        />
        <p className="text-gray-500 dark:text-gray-400">
          Click to {preview ? "change" : "select"} file
        </p>
        {preview && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Selected: {fileInputRef.current?.files?.[0]?.name}
          </p>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full px-3 py-2 rounded border focus:outline-none focus:ring-2",
          "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
          "border-gray-300 focus:ring-blue-200 dark:focus:ring-blue-800"
        )}
      >
        {options.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}

function Checkbox({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className={clsx(
          "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
          "dark:bg-gray-700 dark:border-gray-600"
        )}
      />
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}