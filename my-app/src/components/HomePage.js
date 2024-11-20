import React, { useEffect, useRef, useState } from 'react';
import {useLocation} from 'react-router-dom';
import { Link } from 'react-router-dom';
import Lottie from 'react-lottie'; // Make sure to install react-lottie if not already
import logoAnimation from '../assets/homepage-logo.json';
import mainContentAnimation from '../assets/homepage-anim1.json';
import dashboardAnimation from '../assets/homepage-dashboard.json';
import incomeAnimation from '../assets/homepage-income.json';
import expenseAnimation from '../assets/homepage-expense.json';
import budgetAnimation from '../assets/homepage-budget.json';
import savingsAnimation from '../assets/homepage-savings.json';
import reportsAnimation from '../assets/homepage-reports.json';
import celebrateAnimation from '../assets/homepage-celebrate.json';
import './HomePage.css';

const HomePage = () => {
    const location = useLocation();
    const [playAnimations, setPlayAnimations] = useState({
        dashboard: false,
        income: false,
        expense: false,
        budget: false,
        savings: false,
        reports: false,
    });

    // Create refs for each section
    const dashboardRef = useRef(null);
    const incomeRef = useRef(null);
    const expenseRef = useRef(null);
    const budgetRef = useRef(null);
    const savingsRef = useRef(null);
    const reportsRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const sectionName = entry.target.getAttribute('data-section');
                        setPlayAnimations((prev) => ({
                            ...prev,
                            [sectionName]: true,
                        }));
                    }
                });
            },
            { threshold: 0.5 }
        );

        // Observe each section ref
        const sections = [
            dashboardRef,
            incomeRef,
            expenseRef,
            budgetRef,
            savingsRef,
            reportsRef,
        ];

        sections.forEach((ref) => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => {
            sections.forEach((ref) => {
                if (ref.current) observer.unobserve(ref.current);
            });
        };
    }, []);

    useEffect(() => {
        // Check if the user navigated from Login page
        if (location.state?.fromLogin) {
            const timer = setTimeout(() => {
                scrollToNextSection();
            }, 500); // Adjust delay as needed

            return () => clearTimeout(timer); // Cleanup timer on component unmount
        }
    }, [location]);

    const defaultOptions = (animationData) => ({
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    });

    const scrollToNextSection = () => {
        const targetSection = document.getElementById('dashboard-section');
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 1500; // Duration in milliseconds
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return (c / 2) * t * t + b;
            t--;
            return (-c / 2) * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    };

    return (
        <div className="home-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">
                <Link to="/">
                    <Lottie options={defaultOptions(logoAnimation)} height="4.5rem" width="9.375rem" />
                </Link>
                </div>
                <div className="nav-buttons">
                    <a href="/login" className="nav-button login-button">Login</a>
                    <a href="/login?form=signup" className="nav-button signup-button">Sign Up</a>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-left">
                    <h1 className="title">YOUR ONE-STOP PERSONAL FINANCIAL MANAGEMENT SYSTEM</h1>
                    <p className="tagline">Managing Finance. Anytime. Anywhere.</p>
                    <a href="/login?form=signup" className="get-started-button">Get Started</a>
                </div>
                <div className="content-right">
                    <Lottie options={defaultOptions(mainContentAnimation)} height="25rem" width="25rem" />
                </div>
            </main>

            {/* Influence Section */}
            <div className="influence-section">
                <h2 className="influence-text">How does FinFluence influence you?</h2>
                <button className="scroll-button" onClick={scrollToNextSection}>
                    Learn More
                </button>
            </div>

            {/* Dashboard Section */}
            <section ref={dashboardRef} data-section="dashboard" id="dashboard-section" className="animation-section dashboard-section">
                <div className="dashboard-animation">
                    {playAnimations.dashboard && <Lottie options={defaultOptions(dashboardAnimation)} height="18.75rem" width="18.75rem" />}
                </div>
                <div className="dashboard-content">
                    <h3>Dashboard</h3>
                    <ul>
                        <li>🪙 Access to an interactive dashboard</li>
                        <li>🪙 Easy to use</li>
                        <li>🪙 Interpretable graphs</li>
                        <li>🪙 Track your activity</li>
                    </ul>
                </div>
            </section>

            {/* Income Section */}
            <section ref={incomeRef} data-section="income" id="income-section" className="animation-section income-section">
                <div className='income-content'>
                    <h3>Income</h3>
                    <ul>
                        <li>🪙 Provision for income management</li>
                        <li>🪙 Track where your money comes from</li>
                    </ul>
                </div>
                <div className="income-animation">
                    {playAnimations.income && <Lottie options={defaultOptions(incomeAnimation)} height="18.75rem" width="18.75rem" />}
                </div>
            </section>

            {/* Expense Section */}
            <section ref={expenseRef} data-section="expense" id="expense-section" className="animation-section expense-section">
                <div className="expense-animation">
                    {playAnimations.expense && <Lottie options={defaultOptions(expenseAnimation)} height="18.75rem" width="18.75rem" />}
                </div>
                <div className="expense-content">
                    <h3>Expense</h3>
                    <ul>
                        <li>🪙 Track your expenses</li>
                        <li>🪙 Learn how much money is spent where</li>
                        <li>🪙 Helps you to spend wisely</li>
                    </ul>
                </div>
            </section>

            {/* Budget Section */}
            <section ref={budgetRef} data-section="budget" id="budget-section" className="animation-section budget-section">
                <div className="budget-content">
                    <h3>Budget</h3>
                    <ul>
                        <li>🪙 Create budgets</li>
                        <li>🪙 Check your expense</li>
                        <li>🪙 Track your activity</li>
                    </ul>
                </div>
                <div className="budget-animation">
                    {playAnimations.budget && <Lottie options={defaultOptions(budgetAnimation)} height="18.75rem" width="18.75rem" />}
                </div>
            </section>

            {/* Savings Section */}
            <section ref={savingsRef} data-section="savings" id="savings-section" className="animation-section savings-section">
                <div className="savings-animation">
                    {playAnimations.savings && <Lottie options={defaultOptions(savingsAnimation)} height="18.75rem" width="18.75rem" />}
                </div>
                <div className="savings-content">
                    <h3>Savings</h3>
                    <ul>
                        <li>🪙 Build your goals</li>
                        <li>🪙 Allocate money wisely</li>
                        <li>🪙 Achieve your dreams</li>
                    </ul>
                </div>
            </section>

            {/* Reports Section */}
            <section ref={reportsRef} data-section="reports" id="reports-section" className="animation-section reports-section">
                <div className="reports-content">
                    <h3>Reports</h3>
                    <ul>
                        <li>🪙 Generate reports</li>
                        <li>🪙 Access them anytime</li>
                        <li>🪙 Learn more about your finance</li>
                    </ul>
                </div>
                <div className="reports-animation">
                    {playAnimations.reports && <Lottie options={defaultOptions(reportsAnimation)} height="18.75rem" width="18.75rem" />}
                </div>
            </section>

            {/* Celebrate Section */}
            <section className="celebrate-section">
                <div className="celebrate-animation">
                    <Lottie options={defaultOptions(celebrateAnimation)} height="25rem" width="25rem" />
                </div>
                <h3>Let's Celebrate Your Moola Mastery!</h3>
            </section>

            {/* Footer Section */}
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} FinFluence. All Rights Reserved. | Trademarked by FinFluence. | This website is in beta.</p>
            </footer>
        </div>
    );
};

export default HomePage;
