import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { ArrowButton } from '../ui/ArrowButton';
import { StaggerHeading } from '../ui/LetterStagger';
import { ARTICLES_LIST, ArticleItem } from '../../data/landingData';

interface ArticlesSectionProps {
  onSelectArticle: (article: ArticleItem) => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ onSelectArticle }) => {
  return (
    <section
      id="artikel"
      className="py-16 sm:py-24 lg:py-28 border-t border-black/[0.08]"
    >
      <Container size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Title & CTA */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div>
              <Eyebrow>ARTIKEL & BERITA</Eyebrow>
              <div className="mb-5 sm:mb-6">
                <StaggerHeading
                  as="h2"
                  text="Pahami Peluang. Ambil Keputusan."
                  className="font-h2 font-bold text-[#111111] leading-[1.08] tracking-tight"
                  highlightWord="Keputusan."
                  highlightClass="text-emerald-600"
                />
              </div>
              <p className="text-[16px] sm:text-[17px] text-[#555555] leading-[1.65] max-w-[360px]">
                Analisis pasar, panduan investasi syariah, dan pembaruan strategis industri perjalanan ibadah Indonesia.
              </p>
            </div>

            {/* Bottom-aligned CTA link */}
            <div className="pt-8 sm:pt-10 mt-auto">
              <ArrowButton
                variant="link"
                onClick={() => onSelectArticle(ARTICLES_LIST[0])}
                id="articles-cta-more"
              >
                Lebih Artikel Lainnya
              </ArrowButton>
            </div>
          </div>

          {/* Right Column: 2 Editorial Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ARTICLES_LIST.map((article) => (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group outline-none"
              >
                {/* Image */}
                <div className="relative w-full h-[210px] overflow-hidden bg-[#E8E8E4]">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#111111] uppercase tracking-[0.1em]">
                    {article.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-3 text-[12px] text-[#888888] font-medium mb-2.5">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-[19px] sm:text-[20px] font-bold text-[#111111] leading-snug tracking-tight mb-2.5 group-hover:text-black">
                      {article.title}
                    </h3>

                    <p className="text-[14px] text-[#666666] leading-relaxed line-clamp-3">
                      {article.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-[13px] font-bold text-[#111111]">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight
                      size={15}
                      className="group-hover:translate-x-1.5 transition-transform duration-200"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
