import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const exportToPNG = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
  });
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
};

export const exportToPDF = async (elementId, filename, orientation = "portrait") => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [canvas.width / 2, canvas.height / 2],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(`${filename}.pdf`);
};

export const FORMAT_SIZES = {
  story: { width: 1080, height: 1920, label: "Story (1080×1920)" },
  post: { width: 1080, height: 1080, label: "Post (1080×1080)" },
  banner: { width: 1920, height: 1080, label: "Banner (1920×1080)" },
};