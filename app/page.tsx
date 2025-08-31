"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Lock,
  Unlock,
  User,
  Phone,
  Building,
  Facebook,
  Instagram,
  Music,
  Plus,
  X,
  Upload,
  ImageIcon,
  Palette,
  Download,
  Mail,
  Linkedin,
  Eye,
} from "lucide-react"
import QRCodeLib from "qrcode"

interface CustomField {
  id: string
  label: string
  value: string
}

interface UserData {
  firstName: string
  title: string
  mobile: string
  email: string
  company: string
  facebook: string
  instagram: string
  tiktok: string
  linkedin: string
  x: string
  threads: string
  customFields: CustomField[]
  logo: string
  backgroundColor: string
  textColor: string
  showMobile: boolean
  showEmail: boolean
  selectedSocial: string
}

const colorPresets = [
  { bg: "#1C1B1F", text: "#E6E1E5", name: "Material Dark" },
  { bg: "#FFFBFE", text: "#1C1B1F", name: "Material Light" },
  { bg: "#0F172A", text: "#F1F5F9", name: "Slate" },
  { bg: "#6750A4", text: "#FFFFFF", name: "Primary Purple" },
  { bg: "#1976D2", text: "#FFFFFF", name: "Material Blue" },
  { bg: "#388E3C", text: "#FFFFFF", name: "Material Green" },
  { bg: "#D32F2F", text: "#FFFFFF", name: "Material Red" },
  { bg: "#F57C00", text: "#FFFFFF", name: "Material Orange" },
]

export default function DigitalBusinessCard() {
  const [isLocked, setIsLocked] = useState(true)
  const [unlockCode, setUnlockCode] = useState("")
  const [currentView, setCurrentView] = useState<"qr" | "business">("qr")
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    title: "",
    mobile: "",
    email: "",
    company: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
    x: "",
    threads: "",
    customFields: [],
    logo: "",
    backgroundColor: "#1C1B1F",
    textColor: "#E6E1E5",
    showMobile: false,
    showEmail: false,
    selectedSocial: "none",
  })
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [hasData, setHasData] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setUnlockCode(code)
  }, [])

  useEffect(() => {
    if (hasData) {
      const businessCardUrl = `${window.location.origin}?view=business&data=${encodeURIComponent(JSON.stringify(userData))}`

      QRCodeLib.toDataURL(businessCardUrl, {
        color: {
          dark: "#ea580c", // Orange
          light: "#ffffff", // White
        },
        width: 200,
        margin: 2,
        errorCorrectionLevel: "M",
      }).then(setQrCodeUrl)
    }
  }, [userData, hasData])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const view = urlParams.get("view")
    const data = urlParams.get("data")

    if (view === "business" && data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        setUserData(parsedData)
        setCurrentView("business")
        setHasData(true)
        setIsLocked(true)
      } catch (error) {
        console.error("Error parsing business card data:", error)
      }
    }
  }, [])

  const handleUnlock = () => {
    setIsLocked(false)
  }

  const handleSave = () => {
    if (userData.firstName.trim() && userData.mobile.trim()) {
      setHasData(true)
      setIsLocked(true)
    }
  }

  const handleInputChange = (field: keyof UserData, value: string | boolean) => {
    setUserData((prev) => ({ ...prev, [field]: value }))
  }

  const selectColorPreset = (preset: { bg: string; text: string }) => {
    setUserData((prev) => ({
      ...prev,
      backgroundColor: preset.bg,
      textColor: preset.text,
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUserData((prev) => ({ ...prev, logo: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setUserData((prev) => ({ ...prev, logo: "" }))
  }

  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: "",
      value: "",
    }
    setUserData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }))
  }

  const removeCustomField = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((field) => field.id !== id),
    }))
  }

  const updateCustomField = (id: string, key: "label" | "value", newValue: string) => {
    setUserData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((field) => (field.id === id ? { ...field, [key]: newValue } : field)),
    }))
  }

  const downloadAsPNG = async () => {
    if (!cardRef.current || !hasData) return

    try {
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      })

      const link = document.createElement("a")
      link.download = `${userData.firstName.toLowerCase()}-business-card.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Error generating PNG:", error)
    }
  }

  const getSocialMediaOptions = () => {
    const options = []
    if (userData.linkedin) options.push({ value: "linkedin", label: "LinkedIn", url: userData.linkedin })
    if (userData.x) options.push({ value: "x", label: "X (Twitter)", url: userData.x })
    if (userData.threads) options.push({ value: "threads", label: "Threads", url: userData.threads })
    if (userData.facebook) options.push({ value: "facebook", label: "Facebook", url: userData.facebook })
    if (userData.instagram) options.push({ value: "instagram", label: "Instagram", url: userData.instagram })
    if (userData.tiktok) options.push({ value: "tiktok", label: "TikTok", url: userData.tiktok })
    return options
  }

  const getSelectedSocialUrl = () => {
    const socialOptions = getSocialMediaOptions()
    const selected = socialOptions.find((option) => option.value === userData.selectedSocial)
    return selected?.url || ""
  }

  const toggleView = () => {
    setCurrentView(currentView === "qr" ? "business" : "qr")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card
          ref={cardRef}
          className="border-0 rounded-[28px] shadow-2xl overflow-hidden relative backdrop-blur-sm"
          style={{
            backgroundColor: userData.backgroundColor,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 16px rgba(0, 0, 0, 0.2)",
          }}
        >
          <CardContent className="p-0">
            {isLocked && hasData && userData.firstName && currentView === "business" && (
              <div className="px-8 py-12 space-y-8">
                {userData.logo && (
                  <div className="flex justify-center">
                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg">
                      <img
                        src={userData.logo || "/placeholder.svg"}
                        alt="Logo"
                        className="w-20 h-20 object-contain rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="text-center space-y-3">
                  <h1 className="text-4xl font-serif font-light tracking-tight" style={{ color: userData.textColor }}>
                    {userData.firstName}
                  </h1>
                  {userData.title && (
                    <p
                      className="text-lg font-normal opacity-80"
                      style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                    >
                      {userData.title}
                    </p>
                  )}
                  {userData.company && (
                    <p
                      className="text-base font-light opacity-70"
                      style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                    >
                      {userData.company}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {userData.mobile && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                      <div className="p-2 rounded-xl bg-blue-500/20">
                        <Phone className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                          Mobile
                        </p>
                        <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                          {userData.mobile}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.email && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                      <div className="p-2 rounded-xl bg-cyan-500/20">
                        <Mail className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                          Email
                        </p>
                        <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                          {userData.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.linkedin && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                      <div className="p-2 rounded-xl bg-blue-700/20">
                        <Linkedin className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                          LinkedIn
                        </p>
                        <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                          {userData.linkedin.replace("https://", "").replace("http://", "")}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.x && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                      <div className="p-2 rounded-xl bg-gray-600/20">
                        <X className="h-5 w-5 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                          X (Twitter)
                        </p>
                        <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                          {userData.x.replace("https://", "").replace("http://", "")}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.threads && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                      <div className="p-2 rounded-xl bg-purple-600/20">
                        <Instagram className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                          Threads
                        </p>
                        <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                          {userData.threads.replace("https://", "").replace("http://", "")}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.facebook && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                      <div className="p-2 rounded-xl bg-blue-600/20">
                        <Facebook className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                          Facebook
                        </p>
                        <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                          {userData.facebook.replace("https://", "").replace("http://", "")}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.instagram && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                      <div className="p-2 rounded-xl bg-pink-500/20">
                        <Instagram className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                          Instagram
                        </p>
                        <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                          {userData.instagram.replace("https://", "").replace("http://", "")}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.tiktok && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                      <div className="p-2 rounded-xl bg-red-500/20">
                        <Music className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                          TikTok
                        </p>
                        <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                          {userData.tiktok.replace("https://", "").replace("http://", "")}
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.customFields.map(
                    (field) =>
                      field.value.trim() && (
                        <div
                          key={field.id}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm"
                        >
                          <div className="p-2 rounded-xl bg-orange-500/20">
                            <User className="h-5 w-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs opacity-60" style={{ color: userData.textColor }}>
                              {field.label}
                            </p>
                            <p className="text-sm font-medium" style={{ color: userData.textColor }}>
                              {field.value}
                            </p>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {isLocked && hasData && userData.firstName && currentView === "qr" && (
              <div className="px-8 py-16 text-center space-y-10">
                {userData.logo && (
                  <div className="flex justify-center">
                    <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm shadow-lg">
                      <img
                        src={userData.logo || "/placeholder.svg"}
                        alt="Logo"
                        className="w-16 h-16 object-contain rounded-full"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-baseline justify-center">
                    <h1
                      className="text-7xl font-serif font-light tracking-tight leading-none"
                      style={{ color: userData.textColor }}
                    >
                      {userData.firstName.toLowerCase()}
                    </h1>
                  </div>
                  {userData.title && (
                    <p
                      className="text-base font-normal tracking-wide opacity-80"
                      style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                    >
                      {userData.title.toLowerCase()}
                    </p>
                  )}
                </div>

                {(userData.showMobile || userData.showEmail || userData.selectedSocial !== "none") && (
                  <div className="space-y-2">
                    {userData.showMobile && userData.mobile && (
                      <p
                        className="text-sm font-light opacity-70"
                        style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                      >
                        {userData.mobile}
                      </p>
                    )}
                    {userData.showEmail && userData.email && (
                      <p
                        className="text-sm font-light opacity-70"
                        style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                      >
                        {userData.email}
                      </p>
                    )}
                    {userData.selectedSocial !== "none" && getSelectedSocialUrl() && (
                      <p
                        className="text-sm font-light opacity-70"
                        style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                      >
                        {getSocialMediaOptions().find((option) => option.value === userData.selectedSocial)?.label}
                      </p>
                    )}
                  </div>
                )}

                {qrCodeUrl && (
                  <div className="pt-6">
                    <div className="inline-block p-4 rounded-3xl bg-white/10 backdrop-blur-sm shadow-lg">
                      <img
                        src={qrCodeUrl || "/placeholder.svg"}
                        alt="QR Code"
                        className="w-44 h-44 mx-auto rounded-2xl"
                      />
                    </div>
                    <p
                      className="text-sm mt-4 font-light opacity-60"
                      style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                    >
                      scan to see details
                    </p>
                  </div>
                )}
              </div>
            )}

            {isLocked && !hasData && (
              <div className="px-8 py-20 text-center space-y-8">
                <div className="flex items-baseline justify-center">
                  <h1 className="text-7xl font-serif font-light tracking-tight" style={{ color: userData.textColor }}>
                    your
                  </h1>
                  <span
                    className="text-4xl font-light tracking-wide ml-3"
                    style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                  >
                    name
                  </span>
                </div>
                <p
                  className="text-base font-normal tracking-wide opacity-70"
                  style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                >
                  add your profession /<br />
                  business name
                </p>
                <div className="pt-8">
                  <div className="w-44 h-44 mx-auto bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg">
                    <p className="text-white/60 text-sm font-medium">QR Code</p>
                  </div>
                  <p
                    className="text-sm mt-4 font-light opacity-60"
                    style={{ fontFamily: "Avenir, system-ui, sans-serif", color: userData.textColor }}
                  >
                    scan to see details
                  </p>
                </div>
              </div>
            )}

            {!isLocked && (
              <div className="px-6 py-8">
                <div className="space-y-8 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-orange-500/20">
                        <Palette className="h-5 w-5 text-orange-400" />
                      </div>
                      <Label className="text-white text-lg font-medium">Card Colors</Label>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {colorPresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => selectColorPreset(preset)}
                          className="w-8 h-8 rounded-full border-2 border-transparent hover:border-orange-400 transition-all duration-200 relative shadow-md hover:shadow-lg transform hover:scale-105"
                          style={{ backgroundColor: preset.bg }}
                          title={preset.name}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
                            style={{ backgroundColor: preset.text }}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="text-white text-sm font-medium">Background</Label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={userData.backgroundColor}
                            onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                            className="w-10 h-10 rounded-xl border-2 border-gray-600 bg-transparent cursor-pointer shadow-md"
                          />
                          <Input
                            type="text"
                            value={userData.backgroundColor}
                            onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                            className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white text-sm h-10 flex-1 rounded-xl"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white text-sm font-medium">Text</Label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={userData.textColor}
                            onChange={(e) => handleInputChange("textColor", e.target.value)}
                            className="w-10 h-10 rounded-xl border-2 border-gray-600 bg-transparent cursor-pointer shadow-md"
                          />
                          <Input
                            type="text"
                            value={userData.textColor}
                            onChange={(e) => handleInputChange("textColor", e.target.value)}
                            className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white text-sm h-10 flex-1 rounded-xl"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700/50"></div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-500/20">
                        <ImageIcon className="h-5 w-5 text-blue-400" />
                      </div>
                      <Label className="text-white text-lg font-medium">Logo / Profile Picture</Label>
                    </div>

                    {userData.logo ? (
                      <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-700/50 flex items-center gap-4 shadow-lg">
                        <div className="p-2 rounded-xl bg-white/10">
                          <img
                            src={userData.logo || "/placeholder.svg"}
                            alt="Logo preview"
                            className="w-12 h-12 object-contain rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">Logo uploaded</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeLogo}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-0 h-auto text-xs mt-1 rounded-lg"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-800/30 backdrop-blur-sm border-gray-600 border-2 border-dashed rounded-2xl p-6 text-center hover:bg-gray-800/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label
                          htmlFor="logo-upload"
                          className="cursor-pointer flex flex-col items-center gap-3 text-gray-400 hover:text-white transition-colors"
                        >
                          <div className="p-3 rounded-full bg-gray-700/50">
                            <Upload className="h-6 w-6" />
                          </div>
                          <span className="text-sm font-medium">Upload Logo</span>
                        </Label>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-700/50"></div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500/20">
                        <Eye className="h-5 w-5 text-green-400" />
                      </div>
                      <Label className="text-white text-lg font-medium">Display Options</Label>
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-sm p-5 rounded-2xl border border-gray-700/50 space-y-4">
                      <p className="text-gray-300 text-sm">
                        <span className="font-semibold">Required:</span> First Name and Mobile Number
                        <br />
                        <span className="text-blue-400">All other fields are optional</span>
                      </p>

                      <div className="flex items-center justify-between">
                        <Label className="text-white text-sm">Show Mobile Number</Label>
                        <Switch
                          checked={userData.showMobile}
                          onCheckedChange={(checked) => handleInputChange("showMobile", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-white text-sm">Show Email</Label>
                        <Switch
                          checked={userData.showEmail}
                          onCheckedChange={(checked) => handleInputChange("showEmail", checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white text-sm">Show Social Media</Label>
                        <Select
                          value={userData.selectedSocial}
                          onValueChange={(value) => handleInputChange("selectedSocial", value)}
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                            <SelectValue placeholder="Select social media to display" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="none">None</SelectItem>
                            {getSocialMediaOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-white">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700/50"></div>

                  <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-blue-300 text-sm">
                        <span className="font-semibold">Required:</span> First Name and Mobile Number
                        <br />
                        <span className="text-blue-400">All other fields are optional</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-green-500/20">
                          <User className="h-4 w-4 text-green-400" />
                        </div>
                        First Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        value={userData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-purple-500/20">
                          <Building className="h-4 w-4 text-purple-400" />
                        </div>
                        Title / Position
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="e.g. Software Engineer, Marketing Manager"
                        value={userData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="mobile" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-blue-500/20">
                          <Phone className="h-4 w-4 text-blue-400" />
                        </div>
                        Mobile Number <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={userData.mobile}
                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-cyan-500/20">
                          <Mail className="h-4 w-4 text-cyan-400" />
                        </div>
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={userData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-yellow-500/20">
                          <Building className="h-4 w-4 text-yellow-400" />
                        </div>
                        Company
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Enter your company"
                        value={userData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="linkedin" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-blue-700/20">
                          <Linkedin className="h-4 w-4 text-blue-500" />
                        </div>
                        LinkedIn URL
                      </Label>
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={userData.linkedin}
                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="x" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-gray-600/20">
                          <X className="h-4 w-4 text-gray-300" />
                        </div>
                        X (Twitter) URL
                      </Label>
                      <Input
                        id="x"
                        type="url"
                        placeholder="https://x.com/username"
                        value={userData.x}
                        onChange={(e) => handleInputChange("x", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="threads" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-purple-600/20">
                          <Instagram className="h-4 w-4 text-purple-400" />
                        </div>
                        Threads URL
                      </Label>
                      <Input
                        id="threads"
                        type="url"
                        placeholder="https://threads.net/@username"
                        value={userData.threads}
                        onChange={(e) => handleInputChange("threads", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="facebook" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-blue-600/20">
                          <Facebook className="h-4 w-4 text-blue-500" />
                        </div>
                        Facebook URL
                      </Label>
                      <Input
                        id="facebook"
                        type="url"
                        placeholder="https://facebook.com/username"
                        value={userData.facebook}
                        onChange={(e) => handleInputChange("facebook", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="instagram" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-pink-500/20">
                          <Instagram className="h-4 w-4 text-pink-400" />
                        </div>
                        Instagram URL
                      </Label>
                      <Input
                        id="instagram"
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={userData.instagram}
                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="tiktok" className="text-white flex items-center gap-3 text-sm font-medium">
                        <div className="p-1.5 rounded-lg bg-red-500/20">
                          <Music className="h-4 w-4 text-red-400" />
                        </div>
                        TikTok URL
                      </Label>
                      <Input
                        id="tiktok"
                        type="url"
                        placeholder="https://tiktok.com/@username"
                        value={userData.tiktok}
                        onChange={(e) => handleInputChange("tiktok", e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-12 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {userData.customFields.map((field) => (
                    <div
                      key={field.id}
                      className="space-y-4 p-5 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-white text-sm font-medium">Custom Field</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomField(field.id)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 h-8 w-8 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        type="text"
                        placeholder="Field name (e.g., Website, LinkedIn)"
                        value={field.label}
                        onChange={(e) => updateCustomField(field.id, "label", e.target.value)}
                        className="bg-gray-700/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-11 text-sm rounded-xl"
                      />
                      <Input
                        type="text"
                        placeholder="Field value"
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, "value", e.target.value)}
                        className="bg-gray-700/50 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400 h-11 text-sm rounded-xl"
                      />
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addCustomField}
                    className="w-full bg-gray-800/30 backdrop-blur-sm border-gray-600 text-white hover:bg-gray-700/50 h-12 text-sm font-medium flex items-center gap-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="p-1 rounded-lg bg-green-500/20">
                      <Plus className="h-4 w-4 text-green-400" />
                    </div>
                    Add Custom Field
                  </Button>
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-12 text-sm font-semibold mt-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={!userData.firstName.trim() || !userData.mobile.trim()}
                >
                  Save & Lock Card
                </Button>
              </div>
            )}

            <div className="absolute bottom-6 right-6 flex gap-3">
              {hasData && userData.firstName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleView}
                  className="text-gray-400 hover:text-white hover:bg-white/10 p-3 h-10 w-10 rounded-full backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl"
                  title={currentView === "qr" ? "View Business Card" : "View QR Card"}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {hasData && userData.firstName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadAsPNG}
                  className="text-gray-400 hover:text-white hover:bg-white/10 p-3 h-10 w-10 rounded-full backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl"
                  title="Download as PNG"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={isLocked ? handleUnlock : () => setIsLocked(true)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-3 h-10 w-10 rounded-full backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
