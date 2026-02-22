
import cv2
import numpy as np
from numpy.linalg import norm
from insightface.app import FaceAnalysis
from insightface.model_zoo import get_model
import logging

logger = logging.getLogger(__name__)


class KYCEngine:

    SIMILARITY_THRESHOLD = 0.35   
    LIVENESS_THRESHOLD   = 0.75   
    MIN_FACE_SIZE        = 60     

    def __init__(self, use_gpu: bool = False):
        ctx = 0 if use_gpu else -1

        self.app = FaceAnalysis(
            name="buffalo_l",
            allowed_modules=["detection", "recognition"]
        )
        self.app.prepare(ctx_id=ctx, det_size=(640, 640))

        try:
            self.liveness_model = get_model("2d3ds_s1_anti_spoof_v1")
            self.liveness_model.prepare(ctx_id=ctx)
            self.liveness_available = True
        except Exception as e:
            logger.warning(f"Liveness model non disponible : {e}")
            self.liveness_available = False

        logger.info("KYCEngine initialisé ✅")


    def _decode(self, image_bytes: bytes) -> np.ndarray:
        arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Image invalide ou format non supporté")
        return img

    def _get_largest_face(self, img: np.ndarray):
        """Retourne le visage le plus grand détecté dans l'image."""
        faces = self.app.get(img)
        if not faces:
            return None
        return max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b) / (norm(a) * norm(b)))

    def _check_liveness(self, img: np.ndarray, face) -> dict:
        if not self.liveness_available:
            return {"is_live": True, "score": 1.0}
        try:
            score = float(self.liveness_model.predict(img, face))
            return {"is_live": score >= self.LIVENESS_THRESHOLD, "score": round(score, 4)}
        except Exception as e:
            logger.warning(f"Liveness check échoué : {e}")
            return {"is_live": True, "score": 1.0}


    def verify_kyc(self, document_bytes: bytes, selfie_bytes: bytes) -> dict:
        """
        Compare le visage sur la pièce d'identité avec le selfie live.

        Returns:
            {
                success: bool,
                similarity: float,
                liveness_score: float,
                face_found_on_document: bool,
                face_found_on_selfie: bool,
                reason: str
            }
        """

        base_result = {
            "success": False,
            "similarity": None,
            "liveness_score": None,
            "face_found_on_document": False,
            "face_found_on_selfie": False,
            "reason": ""
        }

        try:
            doc_img = self._decode(document_bytes)
        except ValueError as e:
            return {**base_result, "reason": f"Document : {e}"}

        doc_face = self._get_largest_face(doc_img)
        if doc_face is None:
            return {**base_result, "reason": "Aucun visage détecté sur la pièce d'identité"}

        w = doc_face.bbox[2] - doc_face.bbox[0]
        h = doc_face.bbox[3] - doc_face.bbox[1]
        if w < self.MIN_FACE_SIZE or h < self.MIN_FACE_SIZE:
            return {
                **base_result,
                "face_found_on_document": True,
                "reason": f"Visage sur document trop petit ({w:.0f}x{h:.0f}px). Photo de meilleure qualité requise."
            }

        base_result["face_found_on_document"] = True
        doc_embedding = doc_face.normed_embedding

        try:
            selfie_img = self._decode(selfie_bytes)
        except ValueError as e:
            return {**base_result, "reason": f"Selfie : {e}"}

        selfie_face = self._get_largest_face(selfie_img)
        if selfie_face is None:
            return {**base_result, "reason": "Aucun visage détecté sur le selfie"}

        base_result["face_found_on_selfie"] = True

        liveness = self._check_liveness(selfie_img, selfie_face)
        base_result["liveness_score"] = liveness["score"]

        if not liveness["is_live"]:
            return {
                **base_result,
                "reason": f"Selfie détecté comme non-réel (score={liveness['score']}). Utilisez votre caméra en live."
            }

        selfie_embedding = selfie_face.normed_embedding
        similarity = self._cosine_similarity(doc_embedding, selfie_embedding)
        base_result["similarity"] = round(similarity, 4)

        if similarity >= self.SIMILARITY_THRESHOLD:
            return {
                **base_result,
                "success": True,
                "reason": "KYC validé ✅"
            }
        else:
            return {
                **base_result,
                "reason": f"Visage non concordant avec le document (similarité={similarity:.4f}, seuil={self.SIMILARITY_THRESHOLD})"
            }