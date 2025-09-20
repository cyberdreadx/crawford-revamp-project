import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Calendar, Eye, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  publish_date: string | null;
  created_at: string;
  updated_at: string;
}

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string;
  is_published: boolean;
  is_featured: boolean;
  publish_date: string;
}

const defaultFormData: BlogFormData = {
  title: "",
  excerpt: "",
  content: "",
  featured_image: "",
  category: "market-insights",
  tags: "",
  is_published: false,
  is_featured: false,
  publish_date: new Date().toISOString().split('T')[0],
};

const categories = [
  { value: "market-insights", label: "Market Insights" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "investment", label: "Investment" },
  { value: "neighborhood-guide", label: "Neighborhood Guide" },
  { value: "luxury-trends", label: "Luxury Trends" },
];

const BlogForm = ({ 
  post, 
  onSave, 
  onCancel 
}: { 
  post?: BlogPost; 
  onSave: () => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState<BlogFormData>(
    post ? {
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image: post.featured_image || "",
      category: post.category,
      tags: post.tags.join(", "),
      is_published: post.is_published,
      is_featured: post.is_featured,
      publish_date: post.publish_date ? new Date(post.publish_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    } : defaultFormData
  );
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const postData = {
        title: formData.title,
        slug: post ? undefined : '', // Auto-generated for new posts
        excerpt: formData.excerpt,
        content: formData.content,
        featured_image: formData.featured_image || null,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        publish_date: formData.is_published ? formData.publish_date : null,
        author_id: user.id,
      };

      if (post) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);
        
        if (error) throw error;
        toast.success('Blog post updated successfully');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);
        
        if (error) throw error;
        toast.success('Blog post created successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            placeholder="Brief description of the post..."
          />
        </div>

        <div>
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={12}
            required
            placeholder="Write your blog post content in Markdown..."
          />
        </div>

        <div>
          <Label htmlFor="featured_image">Featured Image URL</Label>
          <Input
            id="featured_image"
            type="url"
            value={formData.featured_image}
            onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="publish_date">Publish Date</Label>
            <Input
              id="publish_date"
              type="date"
              value={formData.publish_date}
              onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="st-pete, luxury-market, investment"
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="is_published">Published</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
            <Label htmlFor="is_featured">Featured</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : post ? 'Update' : 'Create'} Post
        </Button>
      </div>
    </form>
  );
};

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Blog post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingPost(null);
    fetchPosts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPost(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
            </DialogHeader>
            <BlogForm
              post={editingPost || undefined}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No blog posts found. Create your first post to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Publish Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="font-medium">{post.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {post.category.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.is_published ? "default" : "outline"}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {post.publish_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.publish_date).toLocaleDateString()}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.is_published && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={`/blog/${post.slug}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPost(post);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManagement;