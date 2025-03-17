import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Edit, Globe, MoreHorizontal, Plus, Save, Search, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function SeoSettings() {
  const redirects = [
    {
      id: 1,
      source: "/old-page",
      destination: "/new-page",
      type: "301",
      active: true,
    },
    {
      id: 2,
      source: "/products",
      destination: "/shop",
      type: "302",
      active: true,
    },
    {
      id: 3,
      source: "/blog/old-post",
      destination: "/blog/new-post",
      type: "301",
      active: false,
    },
    {
      id: 4,
      source: "/services",
      destination: "/solutions",
      type: "301",
      active: true,
    },
    {
      id: 5,
      source: "/contact-us",
      destination: "/contact",
      type: "302",
      active: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">SEO Settings</h2>
          <p className="text-muted-foreground">Optimize your site for search engines</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="redirects">Redirects</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General SEO Settings</CardTitle>
              <CardDescription>Configure basic SEO settings for your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site-title">Site Title</Label>
                <Input id="site-title" defaultValue="My Professional Website" />
                <p className="text-sm text-muted-foreground">
                  The name of your website, displayed in search results and browser tabs.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  defaultValue="A professional website showcasing our products and services. We provide high-quality solutions for businesses of all sizes."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  A short description of your website that appears in search results. Keep it under 160 characters.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Focus Keywords</Label>
                <Input id="keywords" defaultValue="professional, business, services, solutions" />
                <p className="text-sm text-muted-foreground">Comma-separated keywords relevant to your website.</p>
              </div>

              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="robots">Search Engine Visibility</Label>
                  <p className="text-sm text-muted-foreground">Allow search engines to index your website</p>
                </div>
                <Switch id="robots" defaultChecked />
              </div>

              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="canonical">Use Canonical URLs</Label>
                  <p className="text-sm text-muted-foreground">Automatically generate canonical URLs for all pages</p>
                </div>
                <Switch id="canonical" defaultChecked />
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Integration</CardTitle>
              <CardDescription>Configure how your content appears when shared on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Facebook</h3>
                <div className="space-y-2">
                  <Label htmlFor="og-title">Default Title</Label>
                  <Input id="og-title" defaultValue="My Professional Website" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-description">Default Description</Label>
                  <Textarea
                    id="og-description"
                    defaultValue="Check out our professional services and solutions for your business needs."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-image">Default Image</Label>
                  <div className="flex items-center gap-2">
                    <Input id="og-image" defaultValue="/images/og-image.jpg" />
                    <Button variant="outline">Upload</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Recommended size: 1200 x 630 pixels</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Twitter</h3>
                <div className="space-y-2">
                  <Label htmlFor="twitter-title">Default Title</Label>
                  <Input id="twitter-title" defaultValue="My Professional Website" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter-description">Default Description</Label>
                  <Textarea
                    id="twitter-description"
                    defaultValue="Check out our professional services and solutions for your business needs."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter-image">Default Image</Label>
                  <div className="flex items-center gap-2">
                    <Input id="twitter-image" defaultValue="/images/twitter-image.jpg" />
                    <Button variant="outline">Upload</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Recommended size: 1200 x 675 pixels</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter-card">Card Type</Label>
                  <Select defaultValue="summary_large_image">
                    <SelectTrigger id="twitter-card">
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary with Large Image</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="player">Player</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="redirects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URL Redirects</CardTitle>
              <CardDescription>Manage URL redirects for your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search redirects..." className="pl-8 w-[250px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="301">301 (Permanent)</SelectItem>
                      <SelectItem value="302">302 (Temporary)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Redirect
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source URL</TableHead>
                      <TableHead>Destination URL</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redirects.map((redirect) => (
                      <TableRow key={redirect.id}>
                        <TableCell className="font-medium">{redirect.source}</TableCell>
                        <TableCell>{redirect.destination}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {redirect.type === "301" ? "301 (Permanent)" : "302 (Temporary)"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch checked={redirect.active} />
                            <span>{redirect.active ? "Active" : "Inactive"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ArrowUpRight className="mr-2 h-4 w-4" /> Test
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Settings</CardTitle>
              <CardDescription>Configure your XML sitemap for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="sitemap-enabled">Enable XML Sitemap</Label>
                  <p className="text-sm text-muted-foreground">Generate an XML sitemap for search engines</p>
                </div>
                <Switch id="sitemap-enabled" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Sitemap URL</Label>
                <div className="flex items-center gap-2">
                  <Input value="https://example.com/sitemap.xml" readOnly />
                  <Button variant="outline" size="icon">
                    <Globe className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Your sitemap URL to submit to search engines</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Include in Sitemap</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="include-posts">Posts</Label>
                      <p className="text-sm text-muted-foreground">Include blog posts in the sitemap</p>
                    </div>
                    <Switch id="include-posts" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="include-pages">Pages</Label>
                      <p className="text-sm text-muted-foreground">Include static pages in the sitemap</p>
                    </div>
                    <Switch id="include-pages" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="include-categories">Categories</Label>
                      <p className="text-sm text-muted-foreground">Include category archives in the sitemap</p>
                    </div>
                    <Switch id="include-categories" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="include-tags">Tags</Label>
                      <p className="text-sm text-muted-foreground">Include tag archives in the sitemap</p>
                    </div>
                    <Switch id="include-tags" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Update Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="update-frequency">Update Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="update-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Default Priority</Label>
                  <Select defaultValue="0.7">
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1.0 (Highest)</SelectItem>
                      <SelectItem value="0.9">0.9</SelectItem>
                      <SelectItem value="0.8">0.8</SelectItem>
                      <SelectItem value="0.7">0.7</SelectItem>
                      <SelectItem value="0.6">0.6</SelectItem>
                      <SelectItem value="0.5">0.5 (Medium)</SelectItem>
                      <SelectItem value="0.4">0.4</SelectItem>
                      <SelectItem value="0.3">0.3</SelectItem>
                      <SelectItem value="0.2">0.2</SelectItem>
                      <SelectItem value="0.1">0.1 (Lowest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

