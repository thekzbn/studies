// Supabase Configuration and Client
import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase service functions
export const supabaseService = {
  // Database operations
  async addStudy(studyData) {
    try {
      const { data, error } = await supabase
        .from('studies')
        .insert([{
          title: studyData.title,
          description: studyData.description || '',
          tag: studyData.tag,
          pdf_url: studyData.pdfURL,
          md_url: studyData.mdURL,
          docx_url: studyData.docxURL,
          date: studyData.date || new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error adding study:', error)
      throw error
    }
  },

  async getStudies() {
    try {
      const { data, error } = await supabase
        .from('studies')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error

      // Transform data to match the expected format
      return data.map(study => ({
        id: study.id,
        title: study.title,
        description: study.description,
        tag: study.tag,
        pdfURL: study.pdf_url,
        mdURL: study.md_url,
        docxURL: study.docx_url,
        date: new Date(study.date),
        createdAt: new Date(study.created_at),
        updatedAt: new Date(study.updated_at)
      }))
    } catch (error) {
      console.error('Error getting studies:', error)
      throw error
    }
  },

  async updateStudy(studyId, updateData) {
    try {
      const updatePayload = {}
      
      if (updateData.title) updatePayload.title = updateData.title
      if (updateData.description !== undefined) updatePayload.description = updateData.description
      if (updateData.tag) updatePayload.tag = updateData.tag
      if (updateData.date) updatePayload.date = updateData.date.toISOString()

      const { error } = await supabase
        .from('studies')
        .update(updatePayload)
        .eq('id', studyId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating study:', error)
      throw error
    }
  },

  async deleteStudy(studyId) {
    try {
      const { error } = await supabase
        .from('studies')
        .delete()
        .eq('id', studyId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting study:', error)
      throw error
    }
  },

  // Storage operations
  async uploadFile(file, fileName) {
    try {
      const { data, error } = await supabase.storage
        .from('studies')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('studies')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  async deleteFiles(fileURLs) {
    try {
      const deletePromises = fileURLs.filter(url => url).map(async (url) => {
        try {
          // Extract file path from URL
          const urlObj = new URL(url)
          const pathParts = urlObj.pathname.split('/')
          const fileName = pathParts[pathParts.length - 1]
          
          if (fileName) {
            const { error } = await supabase.storage
              .from('studies')
              .remove([fileName])
            
            if (error) {
              console.warn('Error deleting file:', fileName, error)
            }
          }
        } catch (err) {
          console.warn('Error processing file URL:', url, err)
        }
      })

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting files:', error)
      throw error
    }
  },

  // Authentication (for admin dashboard)
  async signInWithPassword(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Utility functions
  generateFileName(originalName, prefix = '') {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    return `${prefix}${timestamp}_${randomString}.${extension}`
  },

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Export the Supabase client for direct access if needed
export { supabase }
export default supabaseService