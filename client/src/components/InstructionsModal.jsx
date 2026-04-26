import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Stack
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    icon: '🎭',
    title: 'The Roles',
    content: 'One player is randomly chosen as the Liar (🤥), while everyone else has the Truth (🎭). Truth players receive the same secret word, but the Liar receives a different, related word.'
  },
  {
    icon: '🗣️',
    title: 'The Discussion',
    content: 'Take turns describing your word without saying it directly. Truth players try to identify the Liar, while the Liar must blend in and pretend they have the exact same word!'
  },
  {
    icon: '🗳️',
    title: 'The Vote',
    content: 'After the timer runs out, it is time to lock in your vote. Select the player you believe is the Liar based on the clues given during the discussion phase.'
  },
  {
    icon: '🏆',
    title: 'The Scoring',
    content: 'If the Liar is caught by the majority, Truth players earn points. But if the Liar successfully escapes detection, they steal the victory and earn bonus points!'
  }
];

export default function InstructionsModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = sessionStorage.getItem('seenInstructions');
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('seenInstructions', 'true');
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'var(--clr-surface)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.15)',
          borderRadius: 4,
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 5, minHeight: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center', width: '100%' }}
          >
            <Typography variant="h1" sx={{ fontSize: '4.5rem', mb: 2, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
              {steps[step].icon}
            </Typography>
            <Typography variant="h4" sx={{ color: 'primary.main', mb: 2, fontWeight: 'bold' }}>
              {steps[step].title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--clr-text-muted)', lineHeight: 1.6, fontSize: '1.1rem' }}>
              {steps[step].content}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
      
      <DialogActions sx={{ px: 5, pb: 4, pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ width: '80px' }}>
          {step > 0 ? (
            <Button onClick={prevStep} sx={{ color: 'var(--clr-text-muted)' }}>Back</Button>
          ) : (
            <Button onClick={handleClose} sx={{ color: 'var(--clr-text-muted)' }}>Skip</Button>
          )}
        </Box>
        
        <Stack direction="row" spacing={1.5} alignItems="center">
          {steps.map((_, idx) => (
            <Box 
              key={idx} 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: idx === step ? 'var(--clr-primary)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s'
              }} 
            />
          ))}
        </Stack>

        <Box sx={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={nextStep} 
            variant="contained" 
            sx={{ 
              background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
              color: 'white',
              px: 3,
              borderRadius: 2,
              whiteSpace: 'nowrap'
            }}
          >
            {step === steps.length - 1 ? 'Play Now' : 'Next'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
