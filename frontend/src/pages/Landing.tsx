// ─────────────────────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { ArrowRight, Users, Target, BookOpen, Zap, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Your second brain for life, habits, and relationships.
            </h1>
            <p className="text-xl text-foreground-secondary mb-8 max-w-3xl mx-auto">
              Capture notes, track habits, and connect everything that matters. Build a personal knowledge graph that grows with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-brand hover:bg-brand/90 text-background font-semibold px-8 py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border border-border hover:bg-background-secondary text-foreground font-medium px-8 py-3 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything connected</h2>
            <p className="text-lg text-foreground-secondary">Link your thoughts, habits, and relationships in one place.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Notes</h3>
              <p className="text-foreground-secondary">Write journal entries and connect them to people, projects, and habits.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Habit tracking</h3>
              <p className="text-foreground-secondary">Build lasting habits with streaks, calendars, and progress tracking.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Entities</h3>
              <p className="text-foreground-secondary">Track people, projects, and topics. See how everything connects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-foreground-secondary mb-4 md:mb-0">
              © 2026 Continuum. Built for productivity.
            </div>
            <div className="flex gap-6 text-sm text-foreground-secondary">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}