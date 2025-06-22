export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          slug: string
          user_id: string
          created_at: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          url: string
          method: string
          headers: Json | null
          body: string | null
          expected_status: number
          expected_body: string | null
          status: string | null
          last_checked_at: string | null
          project_id: string
          created_at: string
        }
      }
      status_checks: {
        Row: {
          id: string
          service_id: string
          checked_at: string
          success: boolean
          status_code: number | null
          response_time_ms: number | null
          matched_body: boolean | null
          error_message: string | null
        }
      }
      incidents: {
        Row: {
          id: string
          service_id: string
          title: string
          description: string
          status: string
          started_at: string
          resolved_at: string | null
          created_at: string
        }
      }
    }
  }
}
