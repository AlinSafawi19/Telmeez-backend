import { Request, Response } from 'express';
import Testimonial, { ITestimonial } from '../models/Testimonial';

// Submit a new testimonial
export const submitTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, position, institution, quote, email } = req.body;

    console.log('📝 Received testimonial submission:', { name, position, institution, quote, email });

    // Validate required fields
    if (!name || !position || !institution || !quote || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if testimonial with same email already exists
    const existingTestimonial = await Testimonial.findOne({ email });
    if (existingTestimonial) {
      return res.status(400).json({
        success: false,
        message: 'A testimonial with this email already exists'
      });
    }

    // Create new testimonial
    const testimonial = new Testimonial({
      name,
      position,
      institution,
      quote,
      email
    });

    console.log('💾 Saving testimonial to database...');
    await testimonial.save();
    console.log('✅ Testimonial saved successfully with ID:', testimonial._id);

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully! It will be reviewed and approved soon.',
      data: {
        id: testimonial._id,
        name: testimonial.name,
        position: testimonial.position,
        institution: testimonial.institution,
        quote: testimonial.quote,
        initials: testimonial.initials,
        date: testimonial.date
      }
    });

  } catch (error) {
    console.error('❌ Error submitting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get latest 3 approved testimonials
export const getLatestTestimonials = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching latest testimonials...');
    
    // Temporarily fetch all testimonials for testing (not just approved ones)
    const testimonials = await Testimonial.find({}) // Removed { isApproved: true } filter
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name position institution quote initials date');

    console.log('📊 Found testimonials:', testimonials.length);
    console.log('📋 Testimonials data:', testimonials);

    res.status(200).json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });

  } catch (error) {
    console.error('❌ Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all testimonials (for admin purposes)
export const getAllTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .select('name position institution quote email initials date isApproved createdAt');

    res.status(200).json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });

  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Approve/Reject testimonial (for admin purposes)
export const updateTestimonialStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isApproved must be a boolean value'
      });
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Testimonial ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: testimonial
    });

  } catch (error) {
    console.error('Error updating testimonial status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 