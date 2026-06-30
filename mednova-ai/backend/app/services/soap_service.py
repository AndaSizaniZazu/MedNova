class SOAPService:
    def generate(self, transcript: str, patient_context: str = ""):
        return {
            "subjective": "",
            "objective": "",
            "assessment": "",
            "plan": "",
            "raw_transcript": transcript,
        }