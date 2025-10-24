import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  name: string;
  title?: string;
  company?: string;
  content: string;
  rating?: number;
  image_url?: string;
  is_featured: boolean;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-2 justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-7 w-7 ${
              star <= rating
                ? 'fill-accent text-accent'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-bold mb-6">Client Testimonials</h2>
          <p className="text-muted-foreground text-2xl max-w-3xl mx-auto">
            Hear what our clients have to say about their experience working with us
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-12 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="border-border hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-12">
                <Quote className="h-16 w-16 text-accent/20 mb-6" />
                
                {testimonial.rating && renderStars(testimonial.rating)}

                <p className="text-foreground text-xl mb-8 italic leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-6">
                  {testimonial.image_url ? (
                    <img
                      src={testimonial.image_url}
                      alt={testimonial.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-accent/20"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent/20">
                      <span className="text-3xl font-bold text-accent">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-xl">
                      {testimonial.name}
                    </p>
                    {(testimonial.title || testimonial.company) && (
                      <p className="text-base text-muted-foreground">
                        {[testimonial.title, testimonial.company]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
