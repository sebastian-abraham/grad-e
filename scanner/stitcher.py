import os

from fpdf import FPDF


def stitch_to_pdf(session_id):
    pdf = FPDF()

    files = sorted(os.listdir("temp"))

    for file in files:
        if file.startswith(session_id):
            pdf.add_page()
            pdf.image(f"temp/{file}", x=0, y=0, w=210)

    output = f"temp/{session_id}.pdf"
    pdf.output(output)

    return output
