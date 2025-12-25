"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Info, Globe, Bookmark, Trash2, Heart, Shield, MessageCircle, Hospital } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getCurrentUserId } from "@/lib/user-session"
import { useState, useEffect } from "react"

const CATEGORIES = [
    { id: "emergency", title: "Emergency", icon: Shield, color: "text-red-500", bg: "bg-red-50" },
    { id: "clinics", title: "Clinics & Hospitals", icon: Hospital, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "helplines", title: "Helplines", icon: Phone, color: "text-green-500", bg: "bg-green-50" },
    { id: "support", title: "Support Groups", icon: Heart, color: "text-purple-500", bg: "bg-purple-50" },
]

const STATIC_RESOURCES = [
    {
        title: "919 National Mental Health Helpline",
        category: "helplines",
        phone: "919",
        content: "Sierra Leone's first toll-free mental health helpline. Free, confidential support and follow-up care links."
    },
    {
        title: "Suicide Prevention & Crisis Line (MHC-SL)",
        category: "emergency",
        phone: "+232 78 522 787",
        content: "24/7 free and confidential crisis support and suicide prevention services."
    },
    {
        title: "Sierra Leone Psychiatric Teaching Hospital",
        category: "clinics",
        phone: "+232 76 612 186",
        content: "Specialized psychiatric evaluations, crisis intervention, and counseling (Mon-Fri, 8AM-6PM)."
    },
    {
        title: "Rainbo Initiative (GBV & Trauma)",
        category: "helplines",
        phone: "+232 76 665 700",
        content: "24/7 support for gender-based violence and trauma, including medical and legal aid."
    },
    {
        title: "Mental Health Coalition Sierra Leone",
        category: "support",
        link: "https://mentalhealthcoalitionsl.com",
        content: "National coalition of organizations advocating for better mental health access and awareness."
    },
    {
        title: "Partners In Health (PIH-SL)",
        category: "support",
        link: "https://pihsierraleone.org",
        content: "Collaborative partner providing community outreach and mental health integration in Kono and Freetown."
    },
]

export default function ResourcesPage() {
    const router = useRouter()
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        setUserId(getCurrentUserId())
    }, [])

    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    const savedResources = useQuery(api.resources.getSavedResources, userId ? { userId } : "skip")
    const removeResource = useMutation(api.resources.removeResource)

    const handleRemove = async (id: any) => {
        try {
            await removeResource({ id })
            toast.success("Resource removed")
        } catch (e) {
            toast.error("Failed to remove resource")
        }
    }

    const filteredResources = activeCategory
        ? STATIC_RESOURCES.filter(r => r.category === activeCategory)
        : STATIC_RESOURCES

    const handleResourceAction = (res: any) => {
        if (res.link) {
            window.open(res.link, '_blank')
        } else if (res.phone) {
            // Just show info toast instead of calling directly as per user request
            navigator.clipboard.writeText(res.phone)
            toast.info(`Number ${res.phone} copied to clipboard`)
        }
    }

    return (
        <div className="min-h-dvh bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 pb-20 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-10 glass border-b border-white/30 px-4 py-3 sm:px-4 sm:py-4 safe-area-top shadow-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/chat")}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full touch-manipulation hover:bg-white/50 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-bold text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Resource Center
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">Verified support in Sierra Leone</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-8">
                {/* Saved Resources Section */}
                {savedResources && savedResources.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Bookmark className="h-5 w-5 text-purple-600" />
                            <h2 className="font-bold text-lg text-gray-800">Your Saved Resources</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savedResources.map((resource) => (
                                <div key={resource._id} className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                            {resource.category}
                                        </span>
                                        <button
                                            onClick={() => handleRemove(resource._id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            title="Remove"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{resource.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.content}</p>

                                    <div className="flex items-center gap-2">
                                        {resource.phone && (
                                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex items-center justify-between group-hover:border-purple-200 transition-colors">
                                                <span className="text-xs font-bold text-gray-700">{resource.phone}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(resource.phone as string)
                                                        toast.success("Number copied")
                                                    }}
                                                    className="text-[10px] text-purple-600 font-bold uppercase"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        )}
                                        {resource.link && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="flex-1 rounded-xl h-10 font-bold hover:bg-purple-100"
                                                onClick={() => window.open(resource.link, '_blank')}
                                            >
                                                <Globe className="h-3 w-3 mr-2" />
                                                Website
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories Grid */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-gray-500" />
                            <h2 className="font-bold text-lg text-gray-800">Browse by Category</h2>
                        </div>
                        {activeCategory && (
                            <button
                                onClick={() => setActiveCategory(null)}
                                className="text-xs font-bold text-purple-600 hover:underline"
                            >
                                Show All
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                                className={cn(
                                    "bg-white/60 backdrop-blur-sm border p-5 rounded-2xl shadow-sm hover:shadow-md hover:bg-white/80 transition-all flex flex-col items-center gap-3 text-center group",
                                    activeCategory === cat.id ? "border-purple-500 ring-2 ring-purple-200" : "border-white"
                                )}
                            >
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", cat.bg)}>
                                    <cat.icon className={cn("h-6 w-6", cat.color)} />
                                </div>
                                <span className="font-bold text-gray-800 text-sm">{cat.title}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Recommended Resources */}
                <section className="space-y-4">
                    <h2 className="font-bold text-lg text-gray-800 px-1">
                        {activeCategory ? `Showing ${CATEGORIES.find(c => c.id === activeCategory)?.title}` : "Verified Resources"}
                    </h2>
                    <div className="space-y-3">
                        {filteredResources.length > 0 ? (
                            filteredResources.map((res, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleResourceAction(res)}
                                    className="bg-white/40 border border-white/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/60 transition-all cursor-pointer shadow-sm group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        {res.category === 'emergency' ? <Shield className="h-5 w-5 text-red-500" /> : <Info className="h-5 w-5 text-blue-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{res.title}</h4>
                                        <p className="text-xs text-gray-500">{res.content}</p>
                                    </div>
                                    <div className="text-right">
                                        {res.phone && (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-bold text-gray-700">{res.phone}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Click to Copy</span>
                                            </div>
                                        )}
                                        {res.link && <Globe className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white/30 rounded-2xl border border-dashed border-gray-300">
                                <p className="text-sm text-gray-500">No resources found in this category yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}
