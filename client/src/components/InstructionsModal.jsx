import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Divider
} from '@mui/material';

export default function InstructionsModal() {
  const [open, setOpen] = useState(false);

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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Playfair Display', textAlign: 'center', fontSize: '1.5rem', color: 'primary.main' }}>
        How to Play Bluff Arena
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body1">
            <strong>🎭 The Setup:</strong> One player is randomly chosen as the <strong>Liar</strong>, while everyone else has the <strong>Truth</strong>.
          </Typography>
          <Divider />
          <Typography variant="body1">
            <strong>🃏 The Prompts:</strong> Truth players all receive the exact same secret word. The Liar receives a completely different (but related) word.
          </Typography>
          <Divider />
          <Typography variant="body1">
            <strong>🗣️ The Discussion:</strong> Players take turns describing their word without saying it directly. Truth players try to identify the Liar, while the Liar must blend in and pretend they have the same word as everyone else!
          </Typography>
          <Divider />
          <Typography variant="body1">
            <strong>🗳️ The Vote:</strong> After discussion, everyone votes on who they think the Liar is.
          </Typography>
          <Divider />
          <Typography variant="body1">
            <strong>🏆 Scoring:</strong> If the Liar is caught, Truth players earn points. If the Liar escapes, they earn bonus points!
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={handleClose} variant="contained" color="primary" size="large" sx={{ px: 4 }}>
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
