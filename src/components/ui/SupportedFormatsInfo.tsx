"use client";

import { IoInformationCircle, IoImage } from "react-icons/io5";

interface SupportedFormatsInfoProps {
  className?: string;
}

export default function SupportedFormatsInfo({
  className,
}: SupportedFormatsInfoProps) {
  return (
    <div
      className={`bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 ${
        className || ""
      }`}
    >
      <div className="flex items-start gap-3">
        <IoInformationCircle className="text-[var(--neon-cyan)] text-xl mt-0.5 flex-shrink-0" />
        <div className="space-y-3">
          <h4 className="text-[var(--text-primary)] font-medium">
            Supported Image Formats
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-1">
                <IoImage className="text-green-500" size={16} />
                Supported
              </h5>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• JPG / JPEG</li>
                <li>• PNG</li>
                <li>• WebP</li>
                <li>• GIF</li>
                <li>• SVG</li>
                <li>• AVIF</li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-[var(--neon-red)] mb-2 flex items-center gap-1">
                <IoImage className="text-red-500" size={16} />
                Not Supported
              </h5>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• HEIC / HEIF (iPhone format)</li>
                <li>• RAW formats</li>
                <li>• TIFF</li>
                <li>• BMP</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-tertiary)] rounded p-3 border-l-2 border-[var(--neon-cyan)]">
            <p className="text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">
                iPhone Users:
              </strong>{" "}
              To capture photos in JPG format instead of HEIC, go to{" "}
              <em>Settings → Camera → Formats</em> and select{" "}
              <strong>"Most Compatible"</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
