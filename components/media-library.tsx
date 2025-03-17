"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Edit,
  FileImage,
  FileText,
  FileVideo,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

export function MediaLibrary() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const mediaItems = [
    {
      id: 1,
      name: "hero-image.jpg",
      type: "image",
      size: "1.2 MB",
      dimensions: "1920x1080",
      uploaded: "2023-03-15",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "product-demo.mp4",
      type: "video",
      size: "24.5 MB",
      dimensions: "1280x720",
      uploaded: "2023-03-10",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "company-logo.png",
      type: "image",
      size: "0.8 MB",
      dimensions: "512x512",
      uploaded: "2023-03-05",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      name: "annual-report.pdf",
      type: "document",
      size: "3.4 MB",
      dimensions: "-",
      uploaded: "2023-02-28",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      name: "team-photo.jpg",
      type: "image",
      size: "2.1 MB",
      dimensions: "2048x1365",
      uploaded: "2023-02-20",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 6,
      name: "product-banner.jpg",
      type: "image",
      size: "1.5 MB",
      dimensions: "1200x600",
      uploaded: "2023-02-15",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 7,
      name: "customer-testimonial.mp4",
      type: "video",
      size: "18.2 MB",
      dimensions: "1280x720",
      uploaded: "2023-02-10",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 8,
      name: "infographic.png",
      type: "image",
      size: "1.7 MB",
      dimensions: "800x1200",
      uploaded: "2023-02-05",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
  ]

  const renderIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="h-6 w-6 text-blue-500" />
      case "video":
        return <FileVideo className="h-6 w-6 text-purple-500" />
      case "document":
        return <FileText className="h-6 w-6 text-yellow-500" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-muted-foreground">Manage your images, videos, and documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> New Folder
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">+24 files this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 GB</div>
            <div className="mt-2">
              <Progress value={42} className="h-2" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">42% of 10 GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">62% of all files</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">13% of all files</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>Browse and manage your media files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search files..." className="pl-8 w-[250px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="File type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        {renderIcon(item.type)}
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.size} • {item.uploaded}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="h-10 px-4 text-left font-medium">
                      <Checkbox />
                    </th>
                    <th className="h-10 px-4 text-left font-medium">Name</th>
                    <th className="h-10 px-4 text-left font-medium">Type</th>
                    <th className="h-10 px-4 text-left font-medium">Size</th>
                    <th className="h-10 px-4 text-left font-medium">Dimensions</th>
                    <th className="h-10 px-4 text-left font-medium">Uploaded</th>
                    <th className="h-10 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mediaItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-4">
                        <Checkbox />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {renderIcon(item.type)}
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{item.type}</Badge>
                      </td>
                      <td className="p-4">{item.size}</td>
                      <td className="p-4">{item.dimensions}</td>
                      <td className="p-4">{item.uploaded}</td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

