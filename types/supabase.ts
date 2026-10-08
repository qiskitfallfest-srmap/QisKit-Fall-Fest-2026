export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      allowed_emails: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'participant' | 'admin' | 'tester' | 'mentor';
          is_active: boolean;
          added_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          role?: 'participant' | 'admin' | 'tester' | 'mentor';
          is_active?: boolean;
          added_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'participant' | 'admin' | 'tester' | 'mentor';
          is_active?: boolean;
          added_by?: string;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          email: string;
          session_id: string;
          video_completed: boolean;
          quiz_score: number;
          quiz_passed: boolean;
          quiz_attempts: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          session_id: string;
          video_completed?: boolean;
          quiz_score?: number;
          quiz_passed?: boolean;
          quiz_attempts?: number;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          session_id?: string;
          video_completed?: boolean;
          quiz_score?: number;
          quiz_passed?: boolean;
          quiz_attempts?: number;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      competition_submissions: {
        Row: {
          id: string;
          email: string;
          competition_type: 'reels' | 'poster' | 'essay';
          submission_url: string;
          submission_title: string | null;
          notes: string | null;
          status: 'submitted' | 'reviewed' | 'shortlisted';
          submitted_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          competition_type: 'reels' | 'poster' | 'essay';
          submission_url: string;
          submission_title?: string | null;
          notes?: string | null;
          status?: 'submitted' | 'reviewed' | 'shortlisted';
          submitted_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          competition_type?: 'reels' | 'poster' | 'essay';
          submission_url?: string;
          submission_title?: string | null;
          notes?: string | null;
          status?: 'submitted' | 'reviewed' | 'shortlisted';
          submitted_at?: string;
        };
      };
      hackathon_teams: {
        Row: {
          id: string;
          name: string;
          lead_email: string;
          lead_name: string;
          vertical: string;
          problem_statement_id: string;
          github_repo_url: string | null;
          submission_notes: string | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          lead_email: string;
          lead_name: string;
          vertical: string;
          problem_statement_id: string;
          github_repo_url?: string | null;
          submission_notes?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          lead_email?: string;
          lead_name?: string;
          vertical?: string;
          problem_statement_id?: string;
          github_repo_url?: string | null;
          submission_notes?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          email: string;
          full_name: string;
          role: 'leader' | 'member';
          status: 'invited' | 'accepted' | 'declined';
          invited_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          email: string;
          full_name: string;
          role?: 'leader' | 'member';
          status?: 'invited' | 'accepted' | 'declined';
          invited_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          email?: string;
          full_name?: string;
          role?: 'leader' | 'member';
          status?: 'invited' | 'accepted' | 'declined';
          invited_at?: string;
          responded_at?: string | null;
        };
      };
      platform_config: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          name: string;
          email: string;
          institution: string | null;
          role: string | null;
          interests: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          institution?: string | null;
          role?: string | null;
          interests?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          institution?: string | null;
          role?: string | null;
          interests?: string[] | null;
          created_at?: string;
        };
      };
      certificate_orders: {
        Row: {
          id: string;
          user_email: string;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          amount_paise: number;
          currency: string;
          status: 'created' | 'attempted' | 'paid' | 'failed' | 'refunded';
          idempotency_key: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          razorpay_order_id: string;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount_paise: number;
          currency?: string;
          status?: 'created' | 'attempted' | 'paid' | 'failed' | 'refunded';
          idempotency_key?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          razorpay_order_id?: string;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount_paise?: number;
          currency?: string;
          status?: 'created' | 'attempted' | 'paid' | 'failed' | 'refunded';
          idempotency_key?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      issued_certificates: {
        Row: {
          id: string;
          serial_number: string;
          user_email: string;
          recipient_name: string;
          institution: string;
          course_name: string;
          order_id: string | null;
          average_quiz_score: number;
          certificate_url: string;
          verification_hash: string;
          issued_at: string;
        };
        Insert: {
          id?: string;
          serial_number: string;
          user_email: string;
          recipient_name: string;
          institution?: string;
          course_name?: string;
          order_id?: string | null;
          average_quiz_score: number;
          certificate_url: string;
          verification_hash: string;
          issued_at?: string;
        };
        Update: {
          id?: string;
          serial_number?: string;
          user_email?: string;
          recipient_name?: string;
          institution?: string;
          course_name?: string;
          order_id?: string | null;
          average_quiz_score?: number;
          certificate_url?: string;
          verification_hash?: string;
          issued_at?: string;
        };
      };
      coding_challenges: {
        Row: {
          id: string;
          problem_code: string;
          title: string;
          level: 'L1' | 'L2' | 'L3' | 'L4';
          points: number;
          function_name: string;
          starter_code: string;
          description: string;
          constraints: string | null;
          time_limit_ms: number;
          memory_limit_mb: number;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          problem_code: string;
          title: string;
          level?: 'L1' | 'L2' | 'L3' | 'L4';
          points?: number;
          function_name: string;
          starter_code: string;
          description: string;
          constraints?: string | null;
          time_limit_ms?: number;
          memory_limit_mb?: number;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          problem_code?: string;
          title?: string;
          level?: 'L1' | 'L2' | 'L3' | 'L4';
          points?: number;
          function_name?: string;
          starter_code?: string;
          description?: string;
          constraints?: string | null;
          time_limit_ms?: number;
          memory_limit_mb?: number;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coding_submissions: {
        Row: {
          id: string;
          user_email: string;
          challenge_id: string;
          source_code: string;
          status: 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'system_error';
          score: number;
          max_score: number;
          passed_tests: number;
          total_tests: number;
          execution_time_ms: number;
          error_message: string | null;
          stdout: string | null;
          stderr: string | null;
          submitted_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_email: string;
          challenge_id: string;
          source_code: string;
          status?: 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'system_error';
          score?: number;
          max_score?: number;
          passed_tests?: number;
          total_tests?: number;
          execution_time_ms?: number;
          error_message?: string | null;
          stdout?: string | null;
          stderr?: string | null;
          submitted_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_email?: string;
          challenge_id?: string;
          source_code?: string;
          status?: 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'system_error';
          score?: number;
          max_score?: number;
          passed_tests?: number;
          total_tests?: number;
          execution_time_ms?: number;
          error_message?: string | null;
          stdout?: string | null;
          stderr?: string | null;
          submitted_at?: string;
          completed_at?: string | null;
        };
      };
      coding_test_results: {
        Row: {
          id: string;
          submission_id: string;
          test_type: 'public' | 'hidden';
          test_number: number;
          test_name: string | null;
          passed: boolean;
          execution_time_ms: number;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          test_type: 'public' | 'hidden';
          test_number: number;
          test_name?: string | null;
          passed?: boolean;
          execution_time_ms?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          test_type?: 'public' | 'hidden';
          test_number?: number;
          test_name?: string | null;
          passed?: boolean;
          execution_time_ms?: number;
          error_message?: string | null;
          created_at?: string;
        };
      };
      coding_drafts: {
        Row: {
          id: string;
          user_email: string;
          challenge_id: string;
          code: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          challenge_id: string;
          code: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          challenge_id?: string;
          code?: string;
          updated_at?: string;
        };
      };
    };
  };
}
