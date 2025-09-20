import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, FileDown } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
const dossiers = [{
  title: "ART HOUSE",
  image: "/lovable-uploads/art-house-dossier-cover.png",
  pdf: "https://arthouse-luxury-cmw5k98.gamma.site/",
  downloadPdf: "/dossiers/Art_House.pdf"
}
// Add more dossiers here
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
		<div className="relative">
			<img src={dossier.image} alt={dossier.title} className="h-64 w-full object-cover" />
			<div className="absolute inset-0 bg-black bg-opacity-40" />
			<CardHeader className="absolute inset-0 flex items-center justify-center">
				<CardTitle className="text-3xl font-bold text-white">
					{dossier.title}
				</CardTitle>
			</CardHeader>
		</div>
		<CardContent className="p-6">
			<div className="flex justify-around">
				<Button variant="outline" asChild>
					<a href={dossier.pdf} target="_blank" rel="noopener noreferrer">
						<Eye className="mr-2 h-4 w-4" /> View
					</a>
				</Button>
				<Button asChild>
					<a href={dossier.downloadPdf} download>
						<FileDown className="mr-2 h-4 w-4" /> Download
					</a>
				</Button>
			</div>
		</CardContent>
	</Card>;
const LuxuryProperties = () => {
  return <div className="pt-[98px]">
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