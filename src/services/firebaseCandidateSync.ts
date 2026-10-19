import { db, storage } from '../firebase'
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { CandidateRegistrationState } from '../types'

/**
 * Synchronizes Candidate registration data and uploaded Resume PDF to Google Firebase.
 * All data and resumes stored here instantly reflect in real-time in the ProXHire Admin Portal.
 */
export async function syncCandidateToFirebase(
  formData: CandidateRegistrationState,
  userId?: string
): Promise<{ success: boolean; docId?: string; resumeUrl?: string }> {
  try {
    const cleanEmail = formData.email.toLowerCase().trim()
    const cleanMobile = formData.mobileNumber.replace(/[\s\-\+]/g, '')
    const last10 = cleanMobile.slice(-10)

    let finalResumeUrl = formData.resumeUrl || null
    let resumeDataUrl = formData.resumeDataUrl || null

    // Fallback: Check localStorage if not in state
    if (!resumeDataUrl) {
      try {
        resumeDataUrl = localStorage.getItem('resume_' + cleanEmail)
      } catch {
        // LocalStorage quota ignore
      }
    }

    // Determine if chunking is required for Firestore (< 750 KB fits in 1 Firestore doc)
    const isSingleDoc = resumeDataUrl ? resumeDataUrl.length < 750 * 1024 : true
    const CHUNK_SIZE = 500 * 1024
    const totalChunks = (resumeDataUrl && !isSingleDoc) ? Math.ceil(resumeDataUrl.length / CHUNK_SIZE) : 1

    // If file is larger, store chunks in Firestore so any resume up to 5MB is fully preserved
    if (resumeDataUrl && !isSingleDoc) {
      try {
        const qChunks = query(
          collection(db, 'candidates'),
          where('isResumeChunk', '==', true),
          where('candidateEmail', '==', cleanEmail)
        )
        const oldChunksSnap = await getDocs(qChunks)
        for (const chunkDoc of oldChunksSnap.docs) {
          await deleteDoc(chunkDoc.ref).catch(() => null)
        }
      } catch (err) {
        console.warn('Chunk cleanup notice:', err)
      }

      for (let i = 0; i < totalChunks; i++) {
        const chunkStr = resumeDataUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        await addDoc(collection(db, 'candidates'), {
          isResumeChunk: true,
          candidateEmail: cleanEmail,
          chunkIndex: i,
          totalChunks: totalChunks,
          data: chunkStr,
          createdAt: serverTimestamp(),
        })
      }
    }

    // Build the candidate record expected by Admin Portal
    const candidateData = {
      fullName: formData.fullName.trim(),
      email: cleanEmail,
      mobileNumber: formData.mobileNumber.trim(),
      normalizedMobile: last10,
      currentLocation: formData.city || 'Bengaluru',
      highestEducation: formData.educations[0]?.degree || 'Graduate',
      workExperience: formData.experiences[0]?.jobTitle
        ? `${formData.experiences[0].jobTitle} (${formData.experiences[0].company || ''})`
        : formData.experienceCategory === 'fresher' ? 'Fresher (0 Years)' : '1 - 3 Years',
      preferredRole: formData.preferredRole || formData.department || 'Software Engineer',
      skills: formData.skills || [],
      educations: formData.educations || [],
      experiences: formData.experiences || [],
      projects: formData.projects || [],
      hasResume: !!formData.resumeFileName,
      resumeFileName: formData.resumeFileName || null,
      resumeFileType: formData.resumeFileType || 'application/pdf',
      resumeFileSize: formData.resumeFileSize || 0,
      resumeChunkCount: totalChunks,
      resumeDataUrl: isSingleDoc ? resumeDataUrl : null,
      resumeUrl: finalResumeUrl,
      panMasked: formData.panNumber ? `XXXXXX${formData.panNumber.trim().toUpperCase().slice(-4)}` : null,
      status: 'new',
      viewed: false,
      userId: userId || null,
      registeredAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Save or update document in 'candidates' collection using clean email as document ID
    const candidateDocRef = doc(db, 'candidates', cleanEmail)
    await setDoc(candidateDocRef, candidateData, { merge: true })

    console.log(`✅ [Firebase Candidate Sync] Synced candidate ${cleanEmail} to Firestore 'candidates' collection`)
    return { success: true, docId: cleanEmail, resumeUrl: finalResumeUrl || undefined }
  } catch (error: any) {
    console.error('❌ [Firebase Candidate Sync Error]:', error)
    return { success: false }
  }
}

/**
 * Uploads candidate resume file directly to Firebase Storage and returns download URL
 */
export async function uploadResumeToFirebaseStorage(
  file: File,
  candidateEmail: string
): Promise<string> {
  const cleanEmail = candidateEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
  const storageRef = ref(storage, `resumes/${cleanEmail}_${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadUrl = await getDownloadURL(snapshot.ref)
  return downloadUrl
}
