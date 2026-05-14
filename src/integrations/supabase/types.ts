export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          recorded_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          created_at: string
          department: string
          designation: string | null
          employee_id: string
          id: string
          joined_on: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          department: string
          designation?: string | null
          employee_id: string
          id?: string
          joined_on?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string
          designation?: string | null
          employee_id?: string
          id?: string
          joined_on?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: number
          amount_paid: number
          created_at: string
          description: string
          due_date: string | null
          id: string
          paid_at: string | null
          semester: number
          status: Database["public"]["Enums"]["fee_status"]
          student_id: string
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          semester: number
          status?: Database["public"]["Enums"]["fee_status"]
          student_id: string
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          semester?: number
          status?: Database["public"]["Enums"]["fee_status"]
          student_id?: string
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          created_at: string
          created_by: string | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          marks_obtained: number
          max_marks: number
          remarks: string | null
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          marks_obtained: number
          max_marks?: number
          remarks?: string | null
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          marks_obtained?: number
          max_marks?: number
          remarks?: string | null
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          audience: Database["public"]["Enums"]["notice_audience"]
          body: string
          branch: string | null
          created_at: string
          created_by: string | null
          id: string
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          audience?: Database["public"]["Enums"]["notice_audience"]
          body: string
          branch?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          audience?: Database["public"]["Enums"]["notice_audience"]
          body?: string
          branch?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          admission_year: number | null
          branch: string
          created_at: string
          date_of_birth: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          roll_number: string
          section: string | null
          semester: number
          user_id: string
          year: number
        }
        Insert: {
          address?: string | null
          admission_year?: number | null
          branch: string
          created_at?: string
          date_of_birth?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          roll_number: string
          section?: string | null
          semester?: number
          user_id: string
          year: number
        }
        Update: {
          address?: string | null
          admission_year?: number | null
          branch?: string
          created_at?: string
          date_of_birth?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          roll_number?: string
          section?: string | null
          semester?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      subjects: {
        Row: {
          branch: string
          code: string
          created_at: string
          credits: number | null
          id: string
          name: string
          semester: number
        }
        Insert: {
          branch: string
          code: string
          created_at?: string
          credits?: number | null
          id?: string
          name: string
          semester: number
        }
        Update: {
          branch?: string
          code?: string
          created_at?: string
          credits?: number | null
          id?: string
          name?: string
          semester?: number
        }
        Relationships: []
      }
      timetable: {
        Row: {
          branch: string
          created_at: string
          day_of_week: number
          end_time: string
          faculty_id: string | null
          id: string
          period: number
          room: string | null
          section: string | null
          start_time: string
          subject_id: string | null
          year: number
        }
        Insert: {
          branch: string
          created_at?: string
          day_of_week: number
          end_time: string
          faculty_id?: string | null
          id?: string
          period: number
          room?: string | null
          section?: string | null
          start_time: string
          subject_id?: string | null
          year: number
        }
        Update: {
          branch?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          faculty_id?: string | null
          id?: string
          period?: number
          room?: string | null
          section?: string | null
          start_time?: string
          subject_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "timetable_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "faculty"
      attendance_status: "present" | "absent" | "late"
      exam_type:
        | "internal_1"
        | "internal_2"
        | "midterm"
        | "final"
        | "assignment"
      fee_status: "paid" | "pending" | "overdue" | "partial"
      notice_audience: "all" | "students" | "faculty"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "faculty"],
      attendance_status: ["present", "absent", "late"],
      exam_type: ["internal_1", "internal_2", "midterm", "final", "assignment"],
      fee_status: ["paid", "pending", "overdue", "partial"],
      notice_audience: ["all", "students", "faculty"],
    },
  },
} as const
