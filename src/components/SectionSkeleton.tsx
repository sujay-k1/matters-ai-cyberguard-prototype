import { SkeletonText } from '@carbon/react';

interface SectionSkeletonProps {
  lines?: number;
  cardCount?: number;
  heading?: boolean;
}

export function SectionSkeleton({ lines = 4, cardCount = 0, heading = true }: SectionSkeletonProps) {
  return (
    <div className="cg-section-skeleton" aria-live="polite">
      {heading ? <SkeletonText heading width="30%" /> : null}
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonText key={`line-${index}`} paragraph width={index === lines - 1 ? '70%' : '100%'} />
      ))}
      {Array.from({ length: cardCount }).map((_, index) => (
        <div key={`card-${index}`} className="cg-section-skeleton__card">
          <SkeletonText heading width="45%" />
          <SkeletonText paragraph width="100%" />
          <SkeletonText paragraph width="80%" />
        </div>
      ))}
    </div>
  );
}
