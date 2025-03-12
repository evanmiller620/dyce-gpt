

export interface LoginActionState {
    status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}


export const login = async (
    _: LoginActionState,
    formData: FormData,
  ): Promise<LoginActionState> => {
    // try {
    //   const validatedData = authFormSchema.parse({
    //     email: formData.get('email'),
    //     password: formData.get('password'),
    //   });
  
    //   await signIn('credentials', {
    //     email: validatedData.email,
    //     password: validatedData.password,
    //     redirect: false,
    //   });
  
    //   return { status: 'success' };
    // } catch (error) {
    //   if (error instanceof z.ZodError) {
    //     return { status: 'invalid_data' };
    //   }
  
    //   return { status: 'failed' };
    // }
    return { status: 'failed' };
  };
  