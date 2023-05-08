import YearRange from "@/components/text/YearRange";
import { useDocumentationContext } from "@/context/DocumentationContext";

export default function DocumentationFooter() {
  const [ documentation ] = useDocumentationContext();
  return (
    <footer className="flex flex-col text-sm lg:text-base lg:flex-row justify-between font-light text-white/40 py-8 my-12 px-8 gap-2 md:gap-0">
      <span>Copyright &copy; <YearRange from={2021} /> Unnamed Team</span>
      <span className="hover:text-white/60">
        <a href={documentation.file.htmlUrl}>Edit this page on GitHub</a>
      </span>
    </footer>
  );
}