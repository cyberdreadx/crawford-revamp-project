import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, FileDown } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
const dossiers = [{
  title: "ART HOUSE",
  image: "/lovable-uploads/art-house-image.jpeg",
  pdf: "https://luxuryinthesky-iovagxi.gamma.site/art-house",
  downloadPdf: "/dossiers/Art_House.pdf"
}, {
  title: "REFLECTION",
  image: "/lovable-uploads/reflection-dossier-cover-2.png",
  pdf: "https://luxuryinthesky-iovagxi.gamma.site/reflection",
  downloadPdf: "/dossiers/Reflection.pdf"
}, {
  title: "400 CENTRAL",
  image: "/lovable-uploads/400-central-dossier-cover.png",
  pdf: "https://luxuryinthesky-iovagxi.gamma.site/",
  downloadPdf: "/dossiers/400_Central.pdf" // Update this path when PDF is available
}, {
  title: "SALTAIRE",
  image: "/lovable-uploads/saltaire-new-cover.jpg",
  pdf: "https://luxuryinthesky-iovagxi.gamma.site/saltaire-luxury",
  downloadPdf: "/dossiers/Saltaire.pdf"
}, {
  title: "WALDORF ASTORIA",
  image: "/lovable-uploads/waldorf-astoria-cover.png",
  pdf: "https://luxuryinthesky-iovagxi.gamma.site/waldorf-astoria-st-petersburg",
  downloadPdf: "/dossiers/Waldorf_Astoria.pdf"
}
];
const DossierCard = ({
  dossier
}: {
  dossier: {
    title: string;
    image: string;
    pdf: string;
    downloadPdf: string;
  };
}) => <Card className="overflow-hidden">
		<div className="relative overflow-hidden">
			<img src={dossier.image} alt={dossier.title} className="h-64 w-full object-cover block scale-130" loading="lazy" />
			<div className="absolute inset-0 bg-black bg-opacity-40" />
			<CardHeader className="absolute inset-0 flex items-center justify-center p-0">
				<CardTitle className="text-3xl font-bold text-white text-center">
					{dossier.title}
				</CardTitle>
			</CardHeader>
		</div>
		<CardContent className="p-6 bg-card/50">
			<div className="flex justify-around gap-3">
				<Button variant="outline" className="flex-1 border-coral-accent text-coral-accent hover:bg-coral-accent hover:text-white" asChild>
					<a href={dossier.pdf} target="_blank" rel="noopener noreferrer">
						<Eye className="mr-2 h-4 w-4" /> View
					</a>
				</Button>
				<Button className="flex-1 bg-coral-accent hover:bg-coral-accent/90 text-white" asChild>
					<a href={dossier.downloadPdf} download>
						<FileDown className="mr-2 h-4 w-4" /> Download
					</a>
				</Button>
			</div>
		</CardContent>
	</Card>;
const LuxuryProperties = () => {
  return <div className="pt-[64px]">
			<Navigation />
			<div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
				<div className="mb-12 text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Luxury Portfolio</h1>
					<p className="mt-3 text-lg text-muted-foreground">
						Explore our curated collection of luxury property dossiers.
					</p>
				</div>
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{dossiers.map(dossier => <DossierCard key={dossier.title} dossier={dossier} />)}
				</div>
			</div>
			<Footer />
		</div>;
};
export default LuxuryProperties;