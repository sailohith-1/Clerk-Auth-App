import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate email format
  const validateEmail = (emailText) => {
    if (!emailText.trim()) {
      setEmailError('');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailText.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validate password strength
  const validatePassword = (passwordText) => {
    if (!passwordText) {
      setPasswordError('');
      return false;
    }
    if (passwordText.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    // Check for password strength (at least one number and one letter)
    const hasNumber = /\d/.test(passwordText);
    const hasLetter = /[a-zA-Z]/.test(passwordText);
    if (!hasNumber || !hasLetter) {
      setPasswordError('Password must contain both letters and numbers');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Validate password match
  const validatePasswordMatch = (confirmText, passwordText) => {
    if (!confirmText) {
      setConfirmPasswordError('');
      return false;
    }
    if (confirmText !== passwordText) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  // Clear all errors
  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');
  };

  const onSignUpPress = async () => {
    clearErrors();

    if (!isLoaded) {
      setGeneralError('Clerk is not loaded yet. Please wait a moment and try again.');
      return;
    }

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isPasswordMatchValid = validatePasswordMatch(confirmPassword, password);

    if (!email || !password || !confirmPassword) {
      if (!email) setEmailError('Email is required');
      if (!password) setPasswordError('Password is required');
      if (!confirmPassword) setConfirmPasswordError('Please confirm your password');
      return;
    }

    if (!isEmailValid || !isPasswordValid || !isPasswordMatchValid) {
      return;
    }

    console.log('All validations passed! Setting loading state...');
    setLoading(true);
    console.log('Loading state set to true');
    try {
      console.log('=== SIGNUP START ===');
      console.log('Email:', email.trim());
      console.log('Password length:', password.length);
      console.log('Clerk loaded:', isLoaded);
      console.log('SignUp object:', signUp ? 'exists' : 'null');
      console.log('SignUp methods:', signUp ? Object.keys(signUp) : 'N/A');
      
      // Create the sign-up attempt
      console.log('Step 1: Calling signUp.create()...');
      let signUpResult;
      try {
        signUpResult = await signUp.create({
          emailAddress: email.trim(),
          password,
        });
        console.log('Step 1: SUCCESS - Sign up created!');
        console.log('Status:', signUpResult.status);
        console.log('SignUp ID:', signUpResult.id);
        console.log('Full result:', JSON.stringify(signUpResult, null, 2));
      } catch (createError) {
        console.error('Step 1: FAILED - signUp.create() error:', createError);
        throw createError;
      }

      // Prepare email verification
      console.log('Step 2: Preparing email verification...');
      try {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        console.log('Step 2: SUCCESS - Email verification prepared!');
      } catch (verifyError) {
        console.error('Step 2: FAILED - prepareEmailAddressVerification error:', verifyError);
        throw verifyError;
      }
      
      console.log('=== SIGNUP SUCCESS ===');

      // Clear form and errors
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      clearErrors();

      // Navigate to verification screen
      console.log('Step 3: Navigating to verification screen...');
      try {
        navigation.navigate('Verification', { email: email.trim() });
        console.log('Step 3: SUCCESS - Navigation called');
      } catch (navError) {
        console.error('Step 3: FAILED - Navigation error:', navError);
        // Still show success even if navigation fails
        Alert.alert(
          'Account Created!',
          'Please check your email for a verification code. You will be redirected to the verification screen.',
          [{ text: 'OK' }]
        );
      }

      // Show success message
      Alert.alert(
        'Account Created!',
        'Please check your email for a verification code.',
        [{ text: 'OK' }]
      );
      
    } catch (err) {
      console.error('=== SIGNUP ERROR ===');
      console.error('Error caught in catch block');
      console.error('Error name:', err?.name);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      
      if (err?.errors) {
        console.error('Error errors array:', err.errors);
        err.errors.forEach((error, index) => {
          console.error(`Error ${index}:`, error);
        });
      }
      
      let errorMessage = 'Failed to sign up. Please try again.';
      let firstError = null;
      
      if (err?.errors && err.errors.length > 0) {
        firstError = err.errors[0];
        errorMessage = firstError.message || firstError.longMessage || firstError.code || errorMessage;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.toString) {
        errorMessage = err.toString();
      }
      
      console.error('Final error message to display:', errorMessage);
      
      // Show user-friendly error messages on screen
      if (firstError?.code === 'form_password_pwned') {
        setPasswordError('Please choose a stronger password (Including any special character');
      } else if (firstError?.code === 'form_identifier_exists') {
        setEmailError('An account with this email already exists. Please sign in instead.');
      } else if (firstError?.code === 'form_password_length_too_short') {
        setPasswordError('Password must be at least 8 characters long');
      } else {
        // For other errors, show general error message
        setGeneralError('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
      console.log('=== SIGNUP PROCESS COMPLETE ===');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.form}>
            <View>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setGeneralError('');
                  if (text) {
                    validateEmail(text);
                  } else {
                    setEmailError('');
                  }
                }}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setGeneralError('');
                    if (text) {
                      validatePassword(text);
                      // Also validate match when password changes
                      if (confirmPassword) {
                        validatePasswordMatch(confirmPassword, text);
                      }
                    } else {
                      setPasswordError('');
                    }
                  }}
                  onBlur={() => validatePassword(password)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, confirmPasswordError && styles.inputError]}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setGeneralError('');
                    if (text && password) {
                      validatePasswordMatch(text, password);
                    } else {
                      setConfirmPasswordError('');
                    }
                  }}
                  onBlur={() => validatePasswordMatch(confirmPassword, password)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                
              </View>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>

            {generalError ? (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.generalErrorText}>{generalError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, (loading || !isLoaded) && styles.buttonDisabled]}
              onPress={() => {
                console.log('Button pressed!');
                onSignUpPress();
              }}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {!isLoaded ? 'Loading Clerk...' : loading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
            
            {!isLoaded && (
              <Text style={styles.warningText}>
                Please wait, Clerk is initializing...
              </Text>
            )}

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#6366f1',
    fontWeight: '600',
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  generalErrorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  generalErrorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
});

