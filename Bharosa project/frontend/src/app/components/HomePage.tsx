import { Link } from "react-router";
import { ArrowRight, TrendingUp, Award, CheckCircle, Users, Clock, Shield } from "lucide-react";

export function HomePage() {
  const featuredScholarships = [
    { id: 1, name: "National Merit Scholarship", amount: "₹50,000", eligibility: "85%+ in 12th", deadline: "March 31, 2026", category: "Merit-based" },
    { id: 2, name: "SC/ST Pre-Matric Scholarship", amount: "₹15,000", eligibility: "SC/ST Category", deadline: "April 15, 2026", category: "Category-based" },
    { id: 3, name: "Girls Education Scholarship", amount: "₹30,000", eligibility: "Female Students", deadline: "March 25, 2026", category: "Gender-based" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section — static, no slider */}
      <div className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl mb-4 font-bold">Find the Scholarships You Truly Qualify For</h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">Discover, Apply, and Track scholarships designed for you</p>
            <Link
              to="/student-details"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-full hover:bg-white/90 transition-all shadow-xl text-lg font-semibold"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">50,000+</div>
              <p className="text-muted-foreground">Students Helped</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-4xl mb-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent font-bold">200+</div>
              <p className="text-muted-foreground">Active Scholarships</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <div className="text-4xl mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent font-bold">95%</div>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Scholarships */}
      <div className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 font-bold">Featured Scholarships</h2>
            <p className="text-xl text-muted-foreground">Start your journey with these popular schemes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredScholarships.map((scholarship) => (
              <div key={scholarship.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-border hover:border-primary/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">{scholarship.category}</span>
                </div>
                <h3 className="text-xl mb-3 font-semibold">{scholarship.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-primary font-semibold">{scholarship.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Eligibility:</span>
                    <span>{scholarship.eligibility}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {scholarship.deadline}</span>
                  </div>
                </div>
                <Link to={`/scholarship/${scholarship.id}`}
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all">
                  View Details
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/scholarships"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all">
              View All Scholarships <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 font-bold">Why Choose BHAROSA?</h2>
            <p className="text-xl text-muted-foreground">Your trusted partner in scholarship discovery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-lg">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl mb-3 font-semibold">Smart Matching</h3>
              <p className="text-muted-foreground">AI-powered algorithm finds scholarships you're most likely to get approved for</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-2xl mb-4 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl mb-3 font-semibold">Secure & Trusted</h3>
              <p className="text-muted-foreground">Your data is encrypted and protected with bank-level security measures</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl mb-3 font-semibold">Easy to Use</h3>
              <p className="text-muted-foreground">Simple step-by-step process with guidance at every stage</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl text-white mb-6 font-bold">Ready to Find Your Perfect Scholarship?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of students who have successfully secured scholarships through BHAROSA</p>
          <Link to="/student-details"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-primary rounded-full hover:bg-white/90 transition-all shadow-2xl text-lg font-semibold">
            Get Started Now <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}